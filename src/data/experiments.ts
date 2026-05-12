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

/* 환경 A: Bare-metal Arch Linux, WD Black SN950X NVMe, 8-core, idle 시스템.
   30s × 5 QDs × 3 modes, 4k randread, --direct=1, nvme.poll_queues=4. */
export const fioQdLatency: FioQdLatencyPoint[] = [
  { qd: 1,   interrupt: 48,  sqpoll: 42,  iopoll: 41  },
  { qd: 4,   interrupt: 45,  sqpoll: 43,  iopoll: 57  },
  { qd: 16,  interrupt: 46,  sqpoll: 46,  iopoll: 66  },
  { qd: 64,  interrupt: 120, sqpoll: 120, iopoll: 135 },
  { qd: 256, interrupt: 476, sqpoll: 480, iopoll: 477 },
];

/* 환경 B: macOS 위 QEMU/KVM 가상 환경, virtio-blk passthrough, 4-core guest, idle.
   같은 워크로드 (30s × 5 QDs × 3 modes, 4k randread, --direct=1).
   emulation overhead 로 디바이스 latency 자체가 baseline 보다 크게 늘어남. */
export const fioQdLatencyQemu: FioQdLatencyPoint[] = [
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

/* 환경 B (QEMU) — 처리량. 환경 A 의 IOPS sweep 은 미수집. */
export const fioQdIopsQemu: FioQdIopsPoint[] = [
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

/* 환경 B (QEMU) — fio 프로세스 CPU 비율 (kthread 미포함) */
export const fioQdCpuQemu: FioQdCpuPoint[] = [
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

/* 환경 A (Arch + SN950X, 8-core), QD=16. usr/sys 는 fio 프로세스 통계만. */
export const fioCpuUsage: FioCpuUsagePoint[] = [
  { mode: 'Interrupt', usrCpu: 6,   sysCpu: 19 },
  { mode: 'SQPOLL',    usrCpu: 100, sysCpu: 0  },
  { mode: 'IOPOLL',    usrCpu: 4,   sysCpu: 95 },
];

/* 환경 B (QEMU on macOS, 4-core), QD=16. 값이 환경 A 와 거의 같다 —
   polling 의 CPU 패턴은 디바이스 속도와 무관하게 항상 100% 다. */
export const fioCpuUsageQemu: FioCpuUsagePoint[] = [
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

/* 베어메탈 Arch (kernel 6.19, 8-core, WD SN950X) 실측 — scripts/bench_adaptive_sweep.sh.
   Polling fraction (실측): Idle 93.9%, 50% 94.0%, 100% 0.0%.
   정책이 idle/50% 에서는 SQPOLL 로 유지, 100% 부하 진입 시 INTERRUPT 로 전환한 결과.
   100% 부하 구간에서 adaptive 는 SQPOLL 의 cliff(531)를 회피하고 interrupt(983)도
   살짝 넘어선다. */
export const adaptiveComparison: AdaptiveComparisonPoint[] = [
  { cpuLoad: 'Idle',  fioInterrupt: 1268, fioSqpoll: 1284, adaptiveC: 1244 },
  { cpuLoad: '50%',   fioInterrupt: 1270, fioSqpoll: 1283, adaptiveC: 1242 },
  { cpuLoad: '100%',  fioInterrupt: 983,  fioSqpoll: 531,  adaptiveC: 1044 },
];

/** QD vs Latency — adaptive C vs fio modes */
export interface AdaptiveQdPoint {
  qd: number;
  fioInterrupt: number;  // μs
  fioSqpoll: number;     // μs
  adaptiveC: number;     // μs
}

/* 베어메탈 Arch (kernel 6.19, 8-core, WD SN950X) 실측, 같은 sweep.
   QD=1,4 에서 adaptive 는 정책상 INTERRUPT 유지 (qd_lo=8 못 넘김) → fioInterrupt 와 일치.
   QD=16+ 에서는 POLLING 으로 전환하지만 SN950X 에서 polling 의 latency 이득이
   2% 안쪽이라 세 모드가 사실상 한 곡선 위에 모인다. */
export const adaptiveQdLatency: AdaptiveQdPoint[] = [
  { qd: 1,   fioInterrupt: 48.6,  fioSqpoll: 44.0,  adaptiveC: 48.9  },
  { qd: 4,   fioInterrupt: 46.2,  fioSqpoll: 45.1,  adaptiveC: 46.2  },
  { qd: 16,  fioInterrupt: 48.9,  fioSqpoll: 48.5,  adaptiveC: 50.1  },
  { qd: 64,  fioInterrupt: 118.2, fioSqpoll: 126.9, adaptiveC: 118.0 },
  { qd: 256, fioInterrupt: 472.6, fioSqpoll: 475.7, adaptiveC: 471.8 },
];

/** QD vs IOPS — Little's Law (QD / latency) 로 latency 데이터로부터 환산.
 * sustained target_qd 가정 하에서 실측 IOPS 와 거의 일치한다. */
export interface AdaptiveQdIopsPoint {
  qd: number;
  fioInterrupt: number; // IOPS
  fioSqpoll: number;
  adaptiveC: number;
}

/* QD sweep IOPS — 베어메탈 Arch + SN950X 실측 (위 latency 와 같은 sweep).
   세 모드가 QD 따라 동일하게 증가하다 QD=64 부터 plateau — 디바이스가 saturate.
   QD=64 와 QD=256 의 IOPS 가 거의 같지만 latency 는 4 배 (118μs → 472μs):
   추가 QD 는 처리량 안 늘리고 queueing 만 더한다 (Little's Law). */
export const adaptiveQdIops: AdaptiveQdIopsPoint[] = [
  { qd: 1,   fioInterrupt: 20576,  fioSqpoll: 22727,  adaptiveC: 20450  },
  { qd: 4,   fioInterrupt: 86580,  fioSqpoll: 88692,  adaptiveC: 86580  },
  { qd: 16,  fioInterrupt: 327198, fioSqpoll: 329897, adaptiveC: 319361 },
  { qd: 64,  fioInterrupt: 541456, fioSqpoll: 504334, adaptiveC: 542373 },
  { qd: 256, fioInterrupt: 541683, fioSqpoll: 538155, adaptiveC: 542602 },
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

/* 베어메탈 Arch (kernel 6.19, 8-core, SN950X) 실측 종합. */
export const summaryTable: SummaryRow[] = [
  {
    metric: 'Avg Latency (QD=16)',
    fioInterrupt: '48.9 us',
    fioSqpoll: '48.5 us',
    adaptiveC: '50.1 us',
  },
  {
    metric: 'Throughput (Idle)',
    fioInterrupt: '1268 MB/s',
    fioSqpoll: '1284 MB/s',
    adaptiveC: '1244 MB/s',
  },
  {
    metric: 'Throughput (CPU 100%)',
    fioInterrupt: '983 MB/s',
    fioSqpoll: '531 MB/s',
    adaptiveC: '1044 MB/s',
  },
  {
    metric: 'Polling fraction (Idle)',
    fioInterrupt: '0%',
    fioSqpoll: '100%',
    adaptiveC: '~94%',
  },
  {
    metric: 'Polling fraction (CPU 100%)',
    fioInterrupt: '0%',
    fioSqpoll: '100%',
    adaptiveC: '~0%',
  },
  {
    metric: 'Measurement Tool',
    fioInterrupt: 'fio',
    fioSqpoll: 'fio',
    adaptiveC: 'C benchmark',
  },
];
