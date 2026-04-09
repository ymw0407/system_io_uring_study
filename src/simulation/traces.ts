import type { TracePoint, TracePreset } from './types';

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
