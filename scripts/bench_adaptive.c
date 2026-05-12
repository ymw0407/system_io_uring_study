/*
 * bench_adaptive.c — Week 3 의 adaptive I/O 정책 구현 (사용자-공간 C)
 *
 * SQPOLL ↔ interrupt 두 ring 을 미리 만들어 두고, /proc/stat 에서 읽은
 * CPU 사용률과 in-flight QD 에 따라 active ring 을 토글한다.
 *
 * usage:
 *   gcc -O2 -o bench_adaptive bench_adaptive.c -luring
 *   sudo ./bench_adaptive <file> [QD]
 *
 * QD 인자는 선택. 기본 32. 1..1024 범위.
 *
 * 빌드 요구사항:
 *   - liburing 헤더 (apt install liburing-dev / pacman -S liburing)
 *   - _GNU_SOURCE define (O_DIRECT, posix_memalign 활성화)
 *
 * 실행 요구사항:
 *   - SQPOLL 은 일반적으로 sudo 권한 필요
 *   - target file 은 O_DIRECT 가능해야 함 — block device 또는 4KB 정렬 regular file
 *   - 측정의 정확도를 위해 *랜덤 offset* 으로 읽음. 디바이스 / 파일은
 *     최소 수 MB 이상이어야 의미 있는 측정이 됨.
 */

#define _GNU_SOURCE
#include <liburing.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#include <linux/fs.h>

#define QD          32
#define BS          4096
#define CPU_THR     70.0
#define QD_THR      8
#define COOLDOWN_MS 500
#define RUNTIME_SEC 10
#define CHECK_MS    200    /* jiffy resolution 노이즈 방지용 측정 윈도우 하한 */

struct cpu_sample {
    unsigned long long user, nice, system, idle;
    unsigned long long iowait, irq, softirq, steal;
};

static size_t g_max_blocks;  /* BS 단위 블록 수 (디바이스 / 파일) */

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

static long ns_diff(struct timespec *a, struct timespec *b) {
    return (b->tv_sec - a->tv_sec) * 1000000000L
         + (b->tv_nsec - a->tv_nsec);
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

/* 디바이스 / 파일 크기 (bytes). 실패 시 -1. */
static off_t detect_size(int fd) {
    struct stat st;
    if (fstat(fd, &st) < 0) return -1;
    if (S_ISBLK(st.st_mode)) {
        uint64_t sz;
        if (ioctl(fd, BLKGETSIZE64, &sz) < 0) return -1;
        return (off_t)sz;
    }
    return st.st_size;
}

/* BS-aligned 랜덤 offset. rand() 만으로는 4GB 까지밖에 안 닿아서 64비트로 확장. */
static off_t random_offset(void) {
    uint64_t r = ((uint64_t)rand() << 31) | (uint64_t)rand();
    return (off_t)(r % g_max_blocks) * BS;
}

/* 1 SQE 를 enqueue. 성공 시 1, SQ 가득 차면 0. submit 은 호출자가 따로. */
static int prep_one(struct io_uring *ring, int file_idx, void *buf) {
    struct io_uring_sqe *sqe = io_uring_get_sqe(ring);
    if (!sqe) return 0;
    io_uring_prep_read(sqe, file_idx, buf, BS, random_offset());
    sqe->flags |= IOSQE_FIXED_FILE;
    return 1;
}

/* inflight 가 0 이 될 때까지 wait_cqe 로 drain. */
static int drain_ring(struct io_uring *ring, int *inflight, long *completed) {
    while (*inflight > 0) {
        struct io_uring_cqe *cqe;
        int ret = io_uring_wait_cqe(ring, &cqe);
        if (ret < 0) return ret;
        io_uring_cqe_seen(ring, cqe);
        (*inflight)--;
        (*completed)++;
    }
    return 0;
}

enum io_mode { MODE_INTERRUPT, MODE_POLLING };

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "usage: %s <file> [QD]\n", argv[0]);
        fprintf(stderr, "  QD: queue depth (default %d, max 1024)\n", QD);
        return 1;
    }

    int target_qd = QD;
    if (argc >= 3) {
        target_qd = atoi(argv[2]);
        if (target_qd < 1 || target_qd > 1024) {
            fprintf(stderr, "QD out of range: %s\n", argv[2]);
            return 1;
        }
    }

    int fd = open(argv[1], O_RDONLY | O_DIRECT);
    if (fd < 0) { perror("open"); return 1; }

    off_t file_size = detect_size(fd);
    if (file_size < (off_t)BS * 1024) {
        fprintf(stderr, "file/device too small: %lld bytes (need >= 4 MB)\n",
                (long long)file_size);
        close(fd);
        return 1;
    }
    g_max_blocks = (size_t)(file_size / BS);
    srand((unsigned)time(NULL));

    /* Two rings: interrupt + SQPOLL */
    struct io_uring ring_int, ring_poll;
    if (io_uring_queue_init(target_qd, &ring_int, 0) < 0) {
        perror("io_uring_queue_init (interrupt)");
        return 1;
    }

    struct io_uring_params p = {0};
    p.flags = IORING_SETUP_SQPOLL;
    p.sq_thread_idle = 2000;
    if (io_uring_queue_init_params(target_qd, &ring_poll, &p) < 0) {
        perror("io_uring_queue_init_params (polling)");
        io_uring_queue_exit(&ring_int);
        return 1;
    }

    /* Register fd with both rings (SQPOLL 호환 + IOSQE_FIXED_FILE 일관성). */
    int reg_fds[] = { fd };
    if (io_uring_register_files(&ring_int, reg_fds, 1) < 0) {
        perror("io_uring_register_files (interrupt)");
        return 1;
    }
    if (io_uring_register_files(&ring_poll, reg_fds, 1) < 0) {
        perror("io_uring_register_files (polling)");
        return 1;
    }

    /* Single buffer 로 충분 — 우리는 데이터를 검증하지 않고 처리량/지연만 잰다.
     * 다중 inflight 가 같은 buffer 를 가리켜도 커널의 DMA 가 안전하게 처리한다. */
    void *buf;
    if (posix_memalign(&buf, BS, BS) != 0) {
        perror("posix_memalign");
        return 1;
    }

    enum io_mode current = MODE_INTERRUPT;
    struct io_uring *active = &ring_int;

    struct cpu_sample prev_cpu, cur_cpu;
    read_cpu(&prev_cpu);

    struct timespec run_start, mode_start, last_check, last_switch;
    clock_gettime(CLOCK_MONOTONIC, &run_start);
    mode_start = run_start;
    last_check = run_start;
    last_switch = run_start;

    int inflight = 0;
    long completed_ios = 0;
    long polling_ns = 0;
    long interrupt_ns = 0;

    /* Bootstrap: fill the ring up to target_qd. */
    for (int j = 0; j < target_qd; j++) {
        if (!prep_one(active, 0, buf)) break;
        inflight++;
    }
    if (io_uring_submit(active) < 0) {
        perror("io_uring_submit (bootstrap)");
        goto cleanup;
    }

    int i = 0;
    while (1) {
        /* 한 건이라도 완료를 기다린다. */
        struct io_uring_cqe *cqe;
        int ret = io_uring_wait_cqe(active, &cqe);
        if (ret < 0) {
            fprintf(stderr, "wait_cqe: %s\n", strerror(-ret));
            break;
        }
        if (cqe->res < 0) {
            fprintf(stderr, "IO error: %s\n", strerror(-cqe->res));
        }
        io_uring_cqe_seen(active, cqe);
        inflight--;
        completed_ios++;

        /* 더 있는 완료들 drain. */
        while (io_uring_peek_cqe(active, &cqe) == 0) {
            if (cqe->res < 0) {
                fprintf(stderr, "IO error: %s\n", strerror(-cqe->res));
            }
            io_uring_cqe_seen(active, cqe);
            inflight--;
            completed_ios++;
        }

        /* target_qd 까지 refill. */
        while (inflight < target_qd) {
            if (!prep_one(active, 0, buf)) break;
            inflight++;
        }
        if (io_uring_submit(active) < 0) {
            fprintf(stderr, "submit failed in main loop\n");
            break;
        }

        /* 주기적으로 시간 + 정책 체크. iter 마다 clock_gettime 부담 줄임. */
        if ((i++ % 200) == 0) {
            struct timespec now;
            clock_gettime(CLOCK_MONOTONIC, &now);

            if (ms_diff(&run_start, &now) >= RUNTIME_SEC * 1000) break;
            if (ms_diff(&last_check, &now) < CHECK_MS) continue;

            read_cpu(&cur_cpu);
            double cpu = calc_cpu_usage(&prev_cpu, &cur_cpu);
            prev_cpu = cur_cpu;
            last_check = now;

            if (ms_diff(&last_switch, &now) < COOLDOWN_MS) continue;

            enum io_mode want = current;
            if (cpu > CPU_THR && current == MODE_POLLING)
                want = MODE_INTERRUPT;
            else if (inflight >= QD_THR && cpu <= CPU_THR
                     && current == MODE_INTERRUPT)
                want = MODE_POLLING;

            if (want != current) {
                /* 옛 ring 의 모든 inflight 를 drain — counter 정확도 + safety */
                if (drain_ring(active, &inflight, &completed_ios) < 0) break;

                /* 모드 시간 누적 */
                long md = ns_diff(&mode_start, &now);
                if (current == MODE_POLLING) polling_ns += md;
                else                          interrupt_ns += md;
                mode_start = now;

                current = want;
                active = (current == MODE_POLLING) ? &ring_poll : &ring_int;
                last_switch = now;

                printf("[switch] -> %s (cpu=%.1f%%, qd=%d)\n",
                       current == MODE_POLLING ? "POLLING" : "INTERRUPT",
                       cpu, inflight);

                /* 새 ring re-bootstrap */
                for (int j = 0; j < target_qd; j++) {
                    if (!prep_one(active, 0, buf)) break;
                    inflight++;
                }
                if (io_uring_submit(active) < 0) break;
            }
        }
    }

    /* 종료 전 남은 inflight drain. */
    drain_ring(active, &inflight, &completed_ios);

    /* 마지막 모드 시간 누적 */
    struct timespec final_now;
    clock_gettime(CLOCK_MONOTONIC, &final_now);
    long md = ns_diff(&mode_start, &final_now);
    if (current == MODE_POLLING) polling_ns += md;
    else                          interrupt_ns += md;

    double elapsed_sec = ms_diff(&run_start, &final_now) / 1000.0;
    double iops = (elapsed_sec > 0) ? completed_ios / elapsed_sec : 0;
    double mbps = iops * BS / (1024.0 * 1024.0);
    double mean_lat_us = (iops > 0) ? (1000000.0 * target_qd) / iops : 0;
    long total_ns = polling_ns + interrupt_ns;
    double polling_pct = (total_ns > 0) ? 100.0 * polling_ns / total_ns : 0;

    printf("---\n");
    printf("QD: %d\n", target_qd);
    printf("Iterations: %d\n", i);
    printf("Completed IOs: %ld\n", completed_ios);
    printf("Elapsed: %.3f s\n", elapsed_sec);
    printf("IOPS: %.0f\n", iops);
    printf("Throughput: %.1f MB/s\n", mbps);
    printf("Mean latency: %.1f us\n", mean_lat_us);
    printf("Polling fraction: %.1f %%\n", polling_pct);
    printf("Final mode: %s\n",
           current == MODE_POLLING ? "POLLING" : "INTERRUPT");

cleanup:
    io_uring_queue_exit(&ring_int);
    io_uring_queue_exit(&ring_poll);
    free(buf);
    close(fd);
    return 0;
}
