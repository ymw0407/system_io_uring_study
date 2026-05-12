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
#define CHECK_MS    200   /* 정책 체크 간격. /proc/stat 의 jiffy resolution 보다 충분히 커야 함 */

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

static long ms_diff(struct timespec *a, struct timespec *b) {
    return (b->tv_sec - a->tv_sec) * 1000L
         + (b->tv_nsec - a->tv_nsec) / 1000000L;
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

    /* Register the fd with both rings.
     * SQPOLL strictly required this on older kernels (<5.11) and remains
     * the safest path on virtualized kernels. Registering both rings
     * lets us use the same prep_read() + IOSQE_FIXED_FILE path uniformly. */
    int reg_fds[] = { fd };
    if (io_uring_register_files(&ring_int, reg_fds, 1) < 0) {
        perror("io_uring_register_files (interrupt)");
        return 1;
    }
    if (io_uring_register_files(&ring_poll, reg_fds, 1) < 0) {
        perror("io_uring_register_files (polling)");
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
    struct timespec last_check = run_start;  /* CPU 샘플 윈도우의 시작점 */

    int i = 0;
    while (1) {
        /* Submit a read request */
        struct io_uring_sqe *sqe = io_uring_get_sqe(active);
        if (!sqe) {
            /* SQ 가 가득 찼다. 두 모드의 처리가 다르다.
             *  - SQPOLL: kthread 가 SQ 를 비워주기를 기다려야 한다
             *            (io_uring_sqring_wait 전용 함수).
             *  - interrupt: 완료 CQE 한 건을 대기해서 슬롯 회수.
             */
            int ret;
            if (current == MODE_POLLING) {
                ret = io_uring_sqring_wait(active);
                if (ret < 0) {
                    fprintf(stderr, "sqring_wait failed: %s\n", strerror(-ret));
                    break;
                }
            } else {
                struct io_uring_cqe *cqe;
                ret = io_uring_wait_cqe(active, &cqe);
                if (ret < 0) {
                    fprintf(stderr, "wait_cqe failed: %s\n", strerror(-ret));
                    break;
                }
                if (cqe->res < 0) {
                    fprintf(stderr, "IO error: %s\n", strerror(-cqe->res));
                }
                io_uring_cqe_seen(active, cqe);
                inflight--;
            }
            sqe = io_uring_get_sqe(active);
            if (!sqe) {
                fprintf(stderr, "get_sqe still NULL after wait\n");
                break;
            }
        }
        /* Use registered file index (0) with IOSQE_FIXED_FILE flag,
         * not the raw fd. This is required because both rings have
         * the fd registered via io_uring_register_files() above. */
        io_uring_prep_read(sqe, 0, buf, BS, 0);
        sqe->flags |= IOSQE_FIXED_FILE;
        int sub = io_uring_submit(active);
        if (sub < 0) {
            fprintf(stderr, "submit failed: %s\n", strerror(-sub));
            break;
        }
        inflight++;

        /* Reap completions */
        struct io_uring_cqe *cqe;
        while (io_uring_peek_cqe(active, &cqe) == 0) {
            io_uring_cqe_seen(active, cqe);
            inflight--;
        }

        /* 정책 체크는 iteration 마다 가벼운 체크 후 CHECK_MS 마다만 실제 측정.
         * 측정 윈도우가 짧으면 /proc/stat 의 jiffy 양자화로 cpu_pct 가
         * 0% ↔ 100% 진동하는 버그를 막는다. */
        if (i % 1000 == 0 && i > 0) {
            struct timespec now;
            clock_gettime(CLOCK_MONOTONIC, &now);

            /* 전체 runtime 종료 체크 */
            if (ms_diff(&run_start, &now) >= RUNTIME_SEC * 1000) break;

            /* 측정 윈도우 확보: 마지막 CPU 샘플 후 CHECK_MS 이상 경과해야 한다 */
            if (ms_diff(&last_check, &now) < CHECK_MS) continue;

            read_cpu(&cur_cpu);
            double cpu = calc_cpu_usage(&prev_cpu, &cur_cpu);
            prev_cpu = cur_cpu;
            last_check = now;

            /* Switch cooldown: 마지막 전환 후 COOLDOWN_MS 이상 경과해야 한다 */
            if (ms_diff(&last_switch, &now) < COOLDOWN_MS) continue;

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
