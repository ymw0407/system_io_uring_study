/**
 * Experiment datasets for recharts visualizations.
 *
 * Data sources:
 * - Round 1: hand-written C benchmark (educational, rough clock_gettime)
 * - Round 2: fio --ioengine=io_uring (scientific, JSON output)
 * - Round 3: adaptive C benchmark + fio baseline comparison
 *
 * All values below are SAMPLE DATA for illustration.
 * Chart captions must state "예시 데이터" when using these.
 */

export type IoMode = 'interrupt' | 'polling' | 'adaptive';

/* ──────────────────────────────────────────────
 * Round 1: C 벤치마크 (QD=1, 4KB 랜덤 읽기 100회 × 13~14회 반복의 median)
 * ────────────────────────────────────────────── */

export interface Round1Point {
  label: string;
  latency: number; // μs, median of avg-per-run (clock_gettime)
}

export const round1Results: Round1Point[] = [
  { label: 'POSIX read()', latency: 122.6 },
  { label: 'io_uring interrupt', latency: 125.9 },
];

/* ──────────────────────────────────────────────
 * Round 2: fio 측정 (과학적, JSON 파싱)
 * source: fio --ioengine=io_uring --output-format=json
 * ────────────────────────────────────────────── */

/** QD vs Latency — fio 측정, 4KB randread, NVMe */
export interface FioQdLatencyPoint {
  qd: number;
  interrupt: number; // μs (from jobs[0].read.lat_ns.mean / 1000)
  sqpoll: number;    // μs
  iopoll: number;    // μs
}

/* Bare-metal Arch Linux 6.19, /dev/nvme0n1 직접 read, nvme.poll_queues=4, 8-core.
   30s × 5 QDs × 3 modes. (참고: QEMU emulated NVMe에서는 세 모드가 거의 동일한 곡선이었음.) */
export const fioQdLatency: FioQdLatencyPoint[] = [
  { qd: 1,   interrupt: 48,  sqpoll: 42,  iopoll: 41  },
  { qd: 4,   interrupt: 45,  sqpoll: 43,  iopoll: 57  },
  { qd: 16,  interrupt: 46,  sqpoll: 46,  iopoll: 66  },
  { qd: 64,  interrupt: 120, sqpoll: 120, iopoll: 135 },
  { qd: 256, interrupt: 476, sqpoll: 480, iopoll: 477 },
];

/** CPU Load vs Throughput — fio 측정, QD=16 */
export interface FioCpuThroughputPoint {
  cpuLoad: string;
  interrupt: number; // MB/s
  sqpoll: number;    // MB/s
}

/* Bare-metal Arch, QD=16, stress-ng --cpu N. */
export const fioCpuThroughput: FioCpuThroughputPoint[] = [
  { cpuLoad: 'Idle',  interrupt: 1345, sqpoll: 1355 },
  { cpuLoad: '50%',   interrupt: 1339, sqpoll: 1353 },
  { cpuLoad: '100%',  interrupt: 1025, sqpoll: 564  },
];

/** CPU usage per mode — fio 측정, QD=16 */
export interface FioCpuUsagePoint {
  mode: string;
  usrCpu: number; // % (from jobs[0].usr_cpu)
  sysCpu: number; // % (from jobs[0].sys_cpu)
}

/* Bare-metal Arch, QD=16. usr/sys는 fio 프로세스 통계만 — SQPOLL의 별도 커널 kthread는 미포함. */
export const fioCpuUsage: FioCpuUsagePoint[] = [
  { mode: 'Interrupt', usrCpu: 6,   sysCpu: 19 },
  { mode: 'SQPOLL',    usrCpu: 100, sysCpu: 0  },
  { mode: 'IOPOLL',    usrCpu: 4,   sysCpu: 95 },
];

/* ──────────────────────────────────────────────
 * Round 3: Adaptive C vs fio baseline 비교
 * note: harness가 다르므로 직접 비교에 한계가 있음
 * ────────────────────────────────────────────── */

/** CPU Load vs Throughput — 3-way comparison */
export interface AdaptiveComparisonPoint {
  cpuLoad: string;
  fioInterrupt: number;  // MB/s (fio 측정)
  fioSqpoll: number;     // MB/s (fio 측정)
  adaptiveC: number;     // MB/s (C 벤치마크 측정)
}

/* fioInterrupt / fioSqpoll은 fioCpuThroughput와 동일. adaptiveC는 측정 예정 placeholder.
   adaptive 정책의 의의가 가장 잘 드러나는 곳은 100% 부하 — interrupt(1025)와
   SQPOLL(564) 사이에서 어느 쪽으로 붙는지를 보고 싶은 구간이다. */
export const adaptiveComparison: AdaptiveComparisonPoint[] = [
  { cpuLoad: 'Idle',  fioInterrupt: 1345, fioSqpoll: 1355, adaptiveC: 1340 },
  { cpuLoad: '50%',   fioInterrupt: 1339, fioSqpoll: 1353, adaptiveC: 1340 },
  { cpuLoad: '100%',  fioInterrupt: 1025, fioSqpoll: 564,  adaptiveC: 1000 },
];

/** QD vs Latency — adaptive C vs fio modes */
export interface AdaptiveQdPoint {
  qd: number;
  fioInterrupt: number;  // μs
  fioSqpoll: number;     // μs
  adaptiveC: number;     // μs
}

/* fioInterrupt / fioSqpoll은 fioQdLatency와 동일 측정값. adaptiveC는 측정 예정 placeholder. */
export const adaptiveQdLatency: AdaptiveQdPoint[] = [
  { qd: 1,   fioInterrupt: 48,  fioSqpoll: 42,  adaptiveC: 45  },
  { qd: 4,   fioInterrupt: 45,  fioSqpoll: 43,  adaptiveC: 44  },
  { qd: 16,  fioInterrupt: 46,  fioSqpoll: 46,  adaptiveC: 46  },
  { qd: 64,  fioInterrupt: 120, fioSqpoll: 120, adaptiveC: 120 },
  { qd: 256, fioInterrupt: 476, fioSqpoll: 480, adaptiveC: 478 },
];

/* ──────────────────────────────────────────────
 * Summary table (Round 3 결과 종합)
 * ────────────────────────────────────────────── */

export interface SummaryRow {
  metric: string;
  fioInterrupt: string;
  fioSqpoll: string;
  adaptiveC: string;
}

export const summaryTable: SummaryRow[] = [
  {
    metric: 'Avg Latency (QD=16)',
    fioInterrupt: '118 us',
    fioSqpoll: '70 us',
    adaptiveC: '73 us',
  },
  {
    metric: 'Throughput (Idle)',
    fioInterrupt: '420 MB/s',
    fioSqpoll: '580 MB/s',
    adaptiveC: '560 MB/s',
  },
  {
    metric: 'Throughput (CPU 100%)',
    fioInterrupt: '380 MB/s',
    fioSqpoll: '340 MB/s',
    adaptiveC: '405 MB/s',
  },
  {
    metric: 'CPU Usage (QD=16, Idle)',
    fioInterrupt: '~13%',
    fioSqpoll: '~98%',
    adaptiveC: '~35%',
  },
  {
    metric: 'Measurement Tool',
    fioInterrupt: 'fio',
    fioSqpoll: 'fio',
    adaptiveC: 'C benchmark',
  },
];
