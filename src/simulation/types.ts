/** I/O mode: polling (SQPOLL) or interrupt (default) */
export type IoMode = 'polling' | 'interrupt';

/** A single point in the workload trace */
export interface TracePoint {
  /** Device latency in μs (what NVMe would return) */
  deviceLatency: number;
  /** Background CPU usage 0-100% (excluding our I/O) */
  bgCpu: number;
}

/** Parameters for the adaptive policy */
export interface AdaptiveParams {
  cpuThreshold: number;    // % above which we switch to interrupt (default: 70)
  qdThreshold: number;     // in-flight count above which we prefer polling (default: 8)
  cooldownIOs: number;     // min I/Os between mode switches (default: 10)
  pollingLatencyGain: number; // μs saved by polling vs interrupt (default: 40)
  pollingCpuCost: number;    // % CPU added by SQPOLL thread (default: 25)
}

/** Result of a single I/O decision */
export interface SimStep {
  index: number;
  deviceLatency: number;   // μs — raw device time
  bgCpu: number;           // % — background CPU
  totalCpu: number;        // % — bgCpu + polling overhead if active
  currentQd: number;       // simulated in-flight count
  mode: IoMode;            // chosen mode for this I/O
  appLatency: number;      // μs — what the application observes
  switched: boolean;       // did a mode switch happen here?
  reason: string;          // why this mode was chosen
}

/** Full simulation/emulation result */
export interface SimResult {
  steps: SimStep[];
  params: AdaptiveParams;
  avgLatencyPolling: number;
  avgLatencyInterrupt: number;
  avgLatencyAdaptive: number;
  switchCount: number;
  pollingRatio: number;    // 0-1, fraction of time in polling
}

export const DEFAULT_PARAMS: AdaptiveParams = {
  cpuThreshold: 70,
  qdThreshold: 8,
  cooldownIOs: 10,
  pollingLatencyGain: 40,
  pollingCpuCost: 25,
};

/** Available trace presets */
export type TracePreset =
  | 'constant'
  | 'step'
  | 'ramp'
  | 'noisy'
  | 'burst'
  | 'custom';
