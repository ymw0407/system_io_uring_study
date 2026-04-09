import type { TracePoint, AdaptiveParams, SimStep, SimResult, IoMode } from './types';

/**
 * Simulator: NO feedback loop.
 * The trace is fixed — mode decisions don't affect CPU or latency readings.
 * This tests the policy's tracking ability in isolation.
 */
export function runSimulation(trace: TracePoint[], params: AdaptiveParams): SimResult {
  const steps: SimStep[] = [];
  let mode: IoMode = 'interrupt';
  let sinceSwitch = params.cooldownIOs; // allow immediate first decision

  let pollingCount = 0;
  let totalAdaptiveLat = 0;
  let totalInterruptLat = 0;
  let totalPollingLat = 0;
  let switchCount = 0;

  for (let i = 0; i < trace.length; i++) {
    const pt = trace[i]!;
    const currentQd = simulateQd(i, trace.length);

    // Latencies for each mode (fixed, no feedback)
    const interruptLat = pt.deviceLatency;
    const pollingLat = Math.max(pt.deviceLatency - params.pollingLatencyGain, pt.deviceLatency * 0.6);

    // Total CPU = background + polling overhead if in polling mode
    const totalCpu = mode === 'polling'
      ? Math.min(100, pt.bgCpu + params.pollingCpuCost)
      : pt.bgCpu;

    // Policy decision
    let switched = false;
    let reason = '';

    if (sinceSwitch >= params.cooldownIOs) {
      if (mode === 'polling' && totalCpu > params.cpuThreshold) {
        mode = 'interrupt';
        switched = true;
        sinceSwitch = 0;
        reason = `CPU ${totalCpu.toFixed(0)}% > ${params.cpuThreshold}%`;
        switchCount++;
      } else if (mode === 'interrupt' && currentQd >= params.qdThreshold && pt.bgCpu <= params.cpuThreshold) {
        mode = 'polling';
        switched = true;
        sinceSwitch = 0;
        reason = `QD=${currentQd} >= ${params.qdThreshold}, CPU=${pt.bgCpu.toFixed(0)}% ok`;
        switchCount++;
      } else {
        reason = mode === 'polling' ? 'CPU ok, stay polling' : 'keep interrupt';
      }
    } else {
      reason = `cooldown (${sinceSwitch}/${params.cooldownIOs})`;
      sinceSwitch++;
    }

    if (!switched) sinceSwitch++;

    const appLatency = mode === 'polling' ? pollingLat : interruptLat;
    totalAdaptiveLat += appLatency;
    totalInterruptLat += interruptLat;
    totalPollingLat += pollingLat;
    if (mode === 'polling') pollingCount++;

    steps.push({
      index: i,
      deviceLatency: pt.deviceLatency,
      bgCpu: pt.bgCpu,
      totalCpu,
      currentQd,
      mode,
      appLatency,
      switched,
      reason,
    });
  }

  const n = trace.length || 1;
  return {
    steps,
    params,
    avgLatencyAdaptive: totalAdaptiveLat / n,
    avgLatencyInterrupt: totalInterruptLat / n,
    avgLatencyPolling: totalPollingLat / n,
    switchCount,
    pollingRatio: pollingCount / n,
  };
}

/** Simulate a varying QD based on position in trace */
function simulateQd(index: number, total: number): number {
  const phase = index / total;
  const base = 4 + Math.sin(phase * Math.PI * 4) * 12;
  return Math.max(1, Math.round(base + (Math.random() - 0.5) * 4));
}
