/*
 * bench_adaptive.c — Week 3 의 adaptive I/O 정책 구현 (사용자-공간 C)
 *
 * SQPOLL ↔ interrupt 두 ring 을 미리 만들어 두고, /proc/stat 에서 읽은
 * CPU 사용률과 in-flight QD 에 따라 active ring 을 토글한다.
 *
 * usage:
 *   gcc -O2 -o bench_adaptive bench_adaptive.c -luring
 *   sudo ./bench_adaptive /dev/nvme0n1
 *   sudo ./bench_adaptive testfile        # 4KB-aligned, large enough
 *
 * 빌드 요구사항:
 *   - liburing 헤더 (libapt: apt install liburing-dev / pacman -S liburing)
 *   - _GNU_SOURCE define (O_DIRECT, posix_memalign 활성화)
 *
 * 실행 요구사항:
 *   - SQPOLL 은 일반적으로 sudo 권한 필요 (커널 5.12+ 에서 unprivileged 허용 옵션)
 *   - target file 은 O_DIRECT 가능해야 함 — block device 또는 4KB 정렬 regular file
 */

#define _GNU_SOURCE
#include <liburing.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#define QD          32
#define BS          4096
#define CPU_THR     70.0
#define QD_THR      8
#define COOLDOWN_MS 500
#define RUNTIME_SEC 10    /* 시간 기반 루프 — cooldown 윈도우가 여러 번 지나도록 */

struct cpu_sample {
    unsigned long long user, nice, system, idle;
    unsigned long long iowait, irq, softirq, steal;
};

static int read_cpu(struct cpu_sample *s) {
    FILE *f = fopen("/proc/stat", "r");
    if (!f) return -1;
    int n = fscanf(f, "cpu %llu %llu %llu %llu %llu %llu %llu %llu",
                   &s->user, &s->nice, &s->system, &s->idle,
                   &s->iowait, &s->irq, &s->softirq, &s->steal);
    fclose(f);
    return (n == 8) ? 0 : -1;
}

static double calc_cpu_usage(struct cpu_sample *prev, struct cpu_sample *cur) {
    unsigned long long prev_idle = prev->idle + prev->iowait;
    unsigned long long cur_idle  = cur->idle  + cur->iowait;
    unsigned long long prev_total = prev->user + prev->nice + prev->system
        + prev->idle + prev->iowait + prev->irq + prev->softirq + prev->steal;
    unsigned long long cur_total = cur->user + cur->nice + cur->system
        + cur->idle + cur->iowait + cur->irq + cur->softirq + cur->steal;
    unsigned long long total_d = cur_total - prev_total;
    unsigned long long idle_d  = cur_idle  - prev_idle;
    if (total_d == 0) return 0.0;
    return 100.0 * (1.0 - (double)idle_d / (double)total_d);
}

enum io_mode { MODE_INTERRUPT, MODE_POLLING };

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "usage: %s <file>\n", argv[0]);
        return 1;
    }

    int fd = open(argv[1], O_RDONLY | O_DIRECT);
    if (fd < 0) { perror("open"); return 1; }

    /* Initialize two rings: interrupt and polling */
    struct io_uring ring_int, ring_poll;
    if (io_uring_queue_init(QD, &ring_int, 0) < 0) {
        perror("io_uring_queue_init (interrupt)");
        return 1;
    }

    struct io_uring_params p = {0};
    p.flags = IORING_SETUP_SQPOLL;
    p.sq_thread_idle = 2000;
    if (io_uring_queue_init_params(QD, &ring_poll, &p) < 0) {
        perror("io_uring_queue_init_params (polling)");
        io_uring_queue_exit(&ring_int);
        return 1;
    }

    enum io_mode current = MODE_INTERRUPT;
    struct io_uring *active = &ring_int;

    struct cpu_sample prev_cpu, cur_cpu;
    read_cpu(&prev_cpu);

    struct timespec last_switch;
    clock_gettime(CLOCK_MONOTONIC, &last_switch);

    void *buf;
    if (posix_memalign(&buf, BS, BS) != 0) {
        perror("posix_memalign");
        return 1;
    }

    int inflight = 0;

    struct timespec run_start;
    clock_gettime(CLOCK_MONOTONIC, &run_start);

    int i = 0;
    while (1) {
        /* Submit a read request */
        struct io_uring_sqe *sqe = io_uring_get_sqe(active);
        if (!sqe) {
            struct io_uring_cqe *cqe;
            io_uring_wait_cqe(active, &cqe);
            io_uring_cqe_seen(active, cqe);
            inflight--;
            sqe = io_uring_get_sqe(active);
        }
        io_uring_prep_read(sqe, fd, buf, BS, 0);
        io_uring_submit(active);
        inflight++;

        /* Reap completions */
        struct io_uring_cqe *cqe;
        while (io_uring_peek_cqe(active, &cqe) == 0) {
            io_uring_cqe_seen(active, cqe);
            inflight--;
        }

        /* Policy decision every 200 iterations */
        if (i % 200 == 0 && i > 0) {
            read_cpu(&cur_cpu);
            double cpu = calc_cpu_usage(&prev_cpu, &cur_cpu);
            prev_cpu = cur_cpu;

            struct timespec now;
            clock_gettime(CLOCK_MONOTONIC, &now);

            /* 전체 runtime 종료 체크 */
            long run_elapsed_ms = (now.tv_sec - run_start.tv_sec) * 1000
                                + (now.tv_nsec - run_start.tv_nsec) / 1000000;
            if (run_elapsed_ms >= RUNTIME_SEC * 1000) break;

            long elapsed_ms = (now.tv_sec - last_switch.tv_sec) * 1000
                            + (now.tv_nsec - last_switch.tv_nsec) / 1000000;

            if (elapsed_ms >= COOLDOWN_MS) {
                if (cpu > CPU_THR && current == MODE_POLLING) {
                    current = MODE_INTERRUPT;
                    active = &ring_int;
                    last_switch = now;
                    printf("[switch] -> INTERRUPT (cpu=%.1f%%)\n", cpu);
                } else if (inflight >= QD_THR && cpu <= CPU_THR
                           && current == MODE_INTERRUPT) {
                    current = MODE_POLLING;
                    active = &ring_poll;
                    last_switch = now;
                    printf("[switch] -> POLLING (cpu=%.1f%%, qd=%d)\n",
                           cpu, inflight);
                }
            }
        }

        i++;
    }

    printf("Done after %d iterations. Final mode: %s\n", i,
           current == MODE_POLLING ? "POLLING" : "INTERRUPT");

    io_uring_queue_exit(&ring_int);
    io_uring_queue_exit(&ring_poll);
    free(buf);
    close(fd);
    return 0;
}
