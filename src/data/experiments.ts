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

/* Bare-metal 4-core Linux, /dev/nvme0n1 직접 read, idle 시스템.
   30s × 5 QDs × 3 modes, 4k randread, --direct=1. */
export const fioQdLatency: FioQdLatencyPoint[] = [
  { qd: 1,   interrupt: 36.3,   sqpoll: 36.5,   iopoll: 39.2   },
  { qd: 4,   interrupt: 62.6,   sqpoll: 65.8,   iopoll: 63.0   },
  { qd: 16,  interrupt: 138.8,  sqpoll: 131.6,  iopoll: 135.8  },
  { qd: 64,  interrupt: 444.2,  sqpoll: 440.2,  iopoll: 431.1  },
  { qd: 256, interrupt: 1644.6, sqpoll: 1733.5, iopoll: 1694.4 },
];

/** QD vs IOPS — fio 측정, 4KB randread, NVMe */
export interface FioQdIopsPoint {
  qd: number;
  interrupt: number; // IOPS (from jobs[0].read.iops)
  sqpoll: number;
  iopoll: number;
}

/* 같은 실험 (4-core, /dev/nvme0n1, 30s × 5 QDs × 3 modes) 의 처리량. */
export const fioQdIops: FioQdIopsPoint[] = [
  { qd: 1,   interrupt: 27214,  sqpoll: 27153,  iopoll: 25255  },
  { qd: 4,   interrupt: 63438,  sqpoll: 60577,  iopoll: 63039  },
  { qd: 16,  interrupt: 114993, sqpoll: 121409, iopoll: 117534 },
  { qd: 64,  interrupt: 143986, sqpoll: 145297, iopoll: 148352 },
  { qd: 256, interrupt: 155619, sqpoll: 147651, iopoll: 151045 },
];

/** QD vs CPU usage — fio 프로세스의 usr+sys 합계 (SQPOLL kthread 별도 점유는 미포함) */
export interface FioQdCpuPoint {
  qd: number;
  interrupt: number; // total CPU %
  sqpoll: number;
  iopoll: number;
}

export const fioQdCpu: FioQdCpuPoint[] = [
  { qd: 1,   interrupt: 24.7, sqpoll: 100.0, iopoll: 100.1 },
  { qd: 4,   interrupt: 28.6, sqpoll: 100.0, iopoll: 100.0 },
  { qd: 16,  interrupt: 22.7, sqpoll: 100.0, iopoll: 100.0 },
  { qd: 64,  interrupt: 29.2, sqpoll: 100.0, iopoll: 99.9  },
  { qd: 256, interrupt: 36.0, sqpoll: 100.0, iopoll: 100.0 },
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

/* Bare-metal 4-core, QD=16. usr/sys는 fio 프로세스 통계만 — SQPOLL의 별도 kthread는 미포함. */
export const fioCpuUsage: FioCpuUsagePoint[] = [
  { mode: 'Interrupt', usrCpu: 8,   sysCpu: 14 },
  { mode: 'SQPOLL',    usrCpu: 100, sysCpu: 0  },
  { mode: 'IOPOLL',    usrCpu: 7,   sysCpu: 93 },
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
 * Round 3.5: 패치된 fio --adaptive_mode (Phase 3, in-process self-switching)
 * 단일 fio 실행 안에서 SQPOLL ↔ interrupt를 신호 기반으로 토글.
 * source: bench_all_baremetal.sh Phase 3 stderr + write_bw_log
 * ────────────────────────────────────────────── */

/** 모드 전환 타임라인 (stderr "io_uring: adaptive switch -> X at t=N ms"에서 파싱) */
export interface AdaptiveTimelinePoint {
  tMs: number;
  mode: 'polling' | 'interrupt';
}

/* 예시 데이터: stress-ng가 30s에서 켜졌다가 60s에서 꺼지는 시나리오. */
export const adaptiveTimeline: AdaptiveTimelinePoint[] = [
  { tMs: 0,     mode: 'polling' },
  { tMs: 31200, mode: 'interrupt' },
  { tMs: 60800, mode: 'polling' },
];

/** 어댑티브 실행 중 100ms 버킷별 대역폭 (write_bw_log에서 파싱) */
export interface AdaptiveBandwidthPoint {
  tMs: number;
  mbps: number;
}

/* 예시 데이터: 90s 실행, 30~60s 구간만 interrupt 모드(처리량 ↓). */
export const adaptiveBandwidth: AdaptiveBandwidthPoint[] = [
  { tMs: 0,     mbps: 1352 },
  { tMs: 10000, mbps: 1349 },
  { tMs: 20000, mbps: 1351 },
  { tMs: 30000, mbps: 1350 },
  { tMs: 31300, mbps: 0    }, // ring rebuild pause (drain + setup ~수 ms)
  { tMs: 32000, mbps: 1024 },
  { tMs: 45000, mbps: 1010 },
  { tMs: 60000, mbps: 1015 },
  { tMs: 60900, mbps: 0    },
  { tMs: 62000, mbps: 1348 },
  { tMs: 80000, mbps: 1352 },
  { tMs: 90000, mbps: 1351 },
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
