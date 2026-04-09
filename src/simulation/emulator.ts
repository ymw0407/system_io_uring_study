import type { TracePoint, AdaptiveParams, SimStep, SimResult, IoMode } from './types';

/**
 * Emulator: WITH feedback loop.
 * Mode decisions affect observed CPU and latency.
 * - Polling mode → adds pollingCpuCost to observed CPU
 * - If oversleep (polling when CPU is high) → CPU spikes further
 * - Interrupt mode → latency increases, but CPU freed
 * This creates realistic oscillation and convergence dynamics.
 */
export function runEmulation(trace: TracePoint[], params: AdaptiveParams): SimResult {
  const steps: SimStep[] = [];
  let mode: IoMode = 'interrupt';
  let sinceSwitch = params.cooldownIOs;

  let pollingCount = 0;
  let totalAdaptiveLat = 0;
  let totalInterruptLat = 0;
  let totalPollingLat = 0;
  let switchCount = 0;

  // Feedback state
  let cpuPressure = 0; // accumulated pressure from mode choices

  for (let i = 0; i < trace.length; i++) {
    const pt = trace[i]!;
    const currentQd = simulateQd(i, trace.length, mode);

    // FEEDBACK: CPU is affected by current mode
    let observedCpu: number;
    if (mode === 'polling') {
      // Polling thread consumes CPU — pressure builds over time
      cpuPressure = Math.min(params.pollingCpuCost, cpuPressure + params.pollingCpuCost * 0.3);
      observedCpu = Math.min(100, pt.bgCpu + cpuPressure);
    } else {
      // Interrupt mode releases CPU — pressure decays
      cpuPressure = Math.max(0, cpuPressure - params.pollingCpuCost * 0.2);
      observedCpu = Math.min(100, pt.bgCpu + cpuPressure);
    }

    // FEEDBACK: Latency is affected by mode AND CPU contention
    const cpuContention = Math.max(0, observedCpu - 80) * 0.5; // penalty above 80%
    const pollingLat = Math.max(
      pt.deviceLatency * 0.5,
      pt.deviceLatency - params.pollingLatencyGain + cpuContention,
    );
    const interruptLat = pt.deviceLatency + cpuContention * 0.3;

    // Policy decision
    let switched = false;
    let reason = '';

    if (sinceSwitch >= params.cooldownIOs) {
      if (mode === 'polling' && observedCpu > params.cpuThreshold) {
        mode = 'interrupt';
        switched = true;
        sinceSwitch = 0;
        reason = `CPU ${observedCpu.toFixed(0)}% > ${params.cpuThreshold}% (feedback)`;
        switchCount++;
      } else if (mode === 'interrupt' && currentQd >= params.qdThreshold && observedCpu <= params.cpuThreshold) {
        mode = 'polling';
        switched = true;
        sinceSwitch = 0;
        reason = `QD=${currentQd}, CPU=${observedCpu.toFixed(0)}% ok → polling`;
        switchCount++;
      } else {
        reason = mode === 'polling'
          ? `CPU ${observedCpu.toFixed(0)}% ok, stay polling`
          : `keep interrupt (QD=${currentQd})`;
      }
    } else {
      reason = `cooldown (${sinceSwitch}/${params.cooldownIOs})`;
      sinceSwitch++;
    }

    if (!switched) sinceSwitch++;

    const appLatency = mode === 'polling' ? pollingLat : interruptLat;
    totalAdaptiveLat += appLatency;
    totalInterruptLat += pt.deviceLatency; // ideal interrupt (no contention)
    totalPollingLat += Math.max(pt.deviceLatency * 0.5, pt.deviceLatency - params.pollingLatencyGain);
    if (mode === 'polling') pollingCount++;

    steps.push({
      index: i,
      deviceLatency: pt.deviceLatency,
      bgCpu: pt.bgCpu,
      totalCpu: observedCpu,
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

/** QD is affected by mode in emulator: polling handles more concurrent I/Os */
function simulateQd(index: number, total: number, mode: IoMode): number {
  const phase = index / total;
  const base = 4 + Math.sin(phase * Math.PI * 4) * 12;
  const modeBonus = mode === 'polling' ? 4 : 0;
  return Math.max(1, Math.round(base + modeBonus + (Math.random() - 0.5) * 4));
}
