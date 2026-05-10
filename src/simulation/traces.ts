import type { TracePoint, TracePreset } from './types';
import { BENCH_CYCLING_STEP_MS } from './types';

/** Generate a trace of (deviceLatency, bgCpu) pairs */
export function generateTrace(preset: TracePreset, length: number): TracePoint[] {
  switch (preset) {
    case 'constant':
      return constantTrace(length);
    case 'step':
      return stepTrace(length);
    case 'ramp':
      return rampTrace(length);
    case 'noisy':
      return noisyTrace(length);
    case 'burst':
      return burstTrace(length);
    case 'bench-cycling':
      return benchCyclingTrace(length);
    case 'custom':
      return constantTrace(length);
  }
}

function constantTrace(n: number): TracePoint[] {
  return Array.from({ length: n }, () => ({
    deviceLatency: 90 + Math.random() * 10,
    bgCpu: 30,
  }));
}

/** CPU jumps from 30% to 85% at midpoint, then back */
function stepTrace(n: number): TracePoint[] {
  return Array.from({ length: n }, (_, i) => {
    const phase = i / n;
    const bgCpu = phase > 0.3 && phase < 0.7 ? 85 : 30;
    return {
      deviceLatency: 85 + Math.random() * 15,
      bgCpu: bgCpu + (Math.random() - 0.5) * 4,
    };
  });
}

/** CPU ramps linearly from 20% to 95% */
function rampTrace(n: number): TracePoint[] {
  return Array.from({ length: n }, (_, i) => ({
    deviceLatency: 80 + Math.random() * 20,
    bgCpu: 20 + (i / n) * 75 + (Math.random() - 0.5) * 5,
  }));
}

/** Random fluctuations in both latency and CPU */
function noisyTrace(n: number): TracePoint[] {
  return Array.from({ length: n }, () => ({
    deviceLatency: 60 + Math.random() * 80,
    bgCpu: 20 + Math.random() * 70,
  }));
}

/** Periodic bursts of high CPU */
function burstTrace(n: number): TracePoint[] {
  return Array.from({ length: n }, (_, i) => {
    const cycle = (i % 200) / 200;
    const inBurst = cycle > 0.6 && cycle < 0.9;
    return {
      deviceLatency: 80 + Math.random() * 20,
      bgCpu: inBurst ? 80 + Math.random() * 15 : 25 + Math.random() * 10,
    };
  });
}

/**
 * Mirrors scripts/bench_compare.sh — the actual stress test running on
 * bare metal. Each trace step ≈ 100 ms (BENCH_CYCLING_STEP_MS), so the
 * default 600-step trace covers 60 s.
 *
 * Schedule (matches bench_compare.sh defaults):
 *   t=0..15s     idle           bgCpu ≈ 25%
 *   t=15..25s    stress-ng      bgCpu ≈ 100%
 *   t=25..40s    idle           bgCpu ≈ 25%
 *   t=40..50s    stress-ng      bgCpu ≈ 100%
 *   t=50..end    idle           bgCpu ≈ 25%
 *
 * deviceLatency stays low (~85μs, NVMe randread baseline) — the cycling
 * lives in the bgCpu signal, which is exactly what the patched fio's
 * adaptive_mode reads from /proc/stat.
 */
function benchCyclingTrace(n: number): TracePoint[] {
  // Schedule in milliseconds, then convert to step indices.
  const LOAD1_START_MS = 15_000;
  const LOAD1_END_MS = 25_000;
  const LOAD2_START_MS = 40_000;
  const LOAD2_END_MS = 50_000;

  return Array.from({ length: n }, (_, i) => {
    const tMs = i * BENCH_CYCLING_STEP_MS;
    const inLoad1 = tMs >= LOAD1_START_MS && tMs < LOAD1_END_MS;
    const inLoad2 = tMs >= LOAD2_START_MS && tMs < LOAD2_END_MS;
    const inStress = inLoad1 || inLoad2;
    return {
      deviceLatency: 85 + Math.random() * 10,
      bgCpu: inStress
        ? 95 + Math.random() * 4   // stress-ng pegs all cores ~100%
        : 22 + Math.random() * 8,  // idle multi-core baseline
    };
  });
}

export function parseCustomTrace(text: string): TracePoint[] {
  return text
    .trim()
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const parts = line.trim().split(/[,\t\s]+/);
      const lat = parseFloat(parts[0] ?? '90');
      const cpu = parseFloat(parts[1] ?? '30');
      return {
        deviceLatency: isNaN(lat) ? 90 : lat,
        bgCpu: isNaN(cpu) ? 30 : Math.min(100, Math.max(0, cpu)),
      };
    });
}
