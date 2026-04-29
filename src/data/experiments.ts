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

export const fioQdLatency: FioQdLatencyPoint[] = [
  { qd: 1,   interrupt: 95,  sqpoll: 78,  iopoll: 72 },
  { qd: 4,   interrupt: 102, sqpoll: 72,  iopoll: 65 },
  { qd: 16,  interrupt: 118, sqpoll: 70,  iopoll: 58 },
  { qd: 64,  interrupt: 145, sqpoll: 74,  iopoll: 62 },
  { qd: 256, interrupt: 210, sqpoll: 92,  iopoll: 78 },
];

/** CPU Load vs Throughput — fio 측정, QD=16 */
export interface FioCpuThroughputPoint {
  cpuLoad: string;
  interrupt: number; // MB/s
  sqpoll: number;    // MB/s
}

export const fioCpuThroughput: FioCpuThroughputPoint[] = [
  { cpuLoad: 'Idle',  interrupt: 420, sqpoll: 580 },
  { cpuLoad: '50%',   interrupt: 400, sqpoll: 510 },
  { cpuLoad: '100%',  interrupt: 380, sqpoll: 340 },
];

/** CPU usage per mode — fio 측정, QD=16 */
export interface FioCpuUsagePoint {
  mode: string;
  usrCpu: number; // % (from jobs[0].usr_cpu)
  sysCpu: number; // % (from jobs[0].sys_cpu)
}

export const fioCpuUsage: FioCpuUsagePoint[] = [
  { mode: 'Interrupt', usrCpu: 5,  sysCpu: 8 },
  { mode: 'SQPOLL',    usrCpu: 3,  sysCpu: 95 },
  { mode: 'IOPOLL',    usrCpu: 12, sysCpu: 6 },
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

export const adaptiveComparison: AdaptiveComparisonPoint[] = [
  { cpuLoad: 'Idle',  fioInterrupt: 420, fioSqpoll: 580, adaptiveC: 560 },
  { cpuLoad: '50%',   fioInterrupt: 400, fioSqpoll: 510, adaptiveC: 515 },
  { cpuLoad: '100%',  fioInterrupt: 380, fioSqpoll: 340, adaptiveC: 405 },
];

/** QD vs Latency — adaptive C vs fio modes */
export interface AdaptiveQdPoint {
  qd: number;
  fioInterrupt: number;  // μs
  fioSqpoll: number;     // μs
  adaptiveC: number;     // μs
}

export const adaptiveQdLatency: AdaptiveQdPoint[] = [
  { qd: 1,   fioInterrupt: 95,  fioSqpoll: 78,  adaptiveC: 82 },
  { qd: 4,   fioInterrupt: 102, fioSqpoll: 72,  adaptiveC: 75 },
  { qd: 16,  fioInterrupt: 118, fioSqpoll: 70,  adaptiveC: 73 },
  { qd: 64,  fioInterrupt: 145, fioSqpoll: 74,  adaptiveC: 76 },
  { qd: 256, fioInterrupt: 210, fioSqpoll: 92,  adaptiveC: 96 },
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
