import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { vars } from '../../styles/theme.css';
import type { SimStep } from '../../simulation/types';
import * as s from './SimChart.css';

interface SimChartProps {
  steps: SimStep[];
  visibleRange: [number, number];
  cpuThreshold: number;
}

export function SimChart({ steps, visibleRange, cpuThreshold }: SimChartProps) {
  const [start, end] = visibleRange;
  const visibleSteps = useMemo(
    () => steps.slice(start, end),
    [steps, start, end],
  );

  return (
    <div className={s.wrapper}>
      <LatencyChart steps={visibleSteps} />
      <CpuChart steps={visibleSteps} cpuThreshold={cpuThreshold} />
    </div>
  );
}

/* ---- Latency chart (lightweight LineChart) ---- */

function LatencyChart({ steps }: { steps: SimStep[] }) {
  const data = useMemo(
    () =>
      steps.map((st) => ({
        index: st.index,
        device: +st.deviceLatency.toFixed(1),
        app: +st.appLatency.toFixed(1),
      })),
    [steps],
  );

  return (
    <div className={s.chartCard}>
      <div className={s.chartTitle}>Latency over I/O</div>
      <div className={s.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={vars.color.border} />
            <XAxis
              dataKey="index"
              stroke={vars.color.textMuted}
              tick={{ fill: vars.color.textMuted, fontSize: 11 }}
              label={{ value: 'I/O Index', position: 'bottom', fill: vars.color.textMuted, fontSize: 12, offset: 0 }}
            />
            <YAxis
              stroke={vars.color.textMuted}
              tick={{ fill: vars.color.textMuted, fontSize: 11 }}
              label={{ value: 'Latency (us)', angle: -90, position: 'insideLeft', fill: vars.color.textMuted, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: vars.color.surfaceAlt,
                border: `1px solid ${vars.color.border}`,
                borderRadius: vars.radius.sm,
                color: vars.color.text,
                fontSize: 12,
                fontFamily: vars.font.mono,
              }}
            />
            <Line
              type="monotone"
              dataKey="device"
              name="Device"
              stroke={vars.color.gray}
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="app"
              name="App"
              stroke={vars.color.accentPolling}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---- CPU & Mode chart ---- */

function CpuChart({ steps, cpuThreshold }: { steps: SimStep[]; cpuThreshold: number }) {
  const data = useMemo(
    () =>
      steps.map((st) => ({
        index: st.index,
        bg: +st.bgCpu.toFixed(1),
        total: +st.totalCpu.toFixed(1),
      })),
    [steps],
  );

  const switchIndices = useMemo(
    () => steps.filter((st) => st.switched).map((st) => st.index),
    [steps],
  );

  return (
    <div className={s.chartCard}>
      <div className={s.chartTitle}>CPU Usage and Mode</div>
      <div className={s.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={vars.color.border} />
            <XAxis
              dataKey="index"
              stroke={vars.color.textMuted}
              tick={{ fill: vars.color.textMuted, fontSize: 11 }}
              label={{ value: 'I/O Index', position: 'bottom', fill: vars.color.textMuted, fontSize: 12, offset: 0 }}
            />
            <YAxis
              domain={[0, 100]}
              stroke={vars.color.textMuted}
              tick={{ fill: vars.color.textMuted, fontSize: 11 }}
              label={{ value: 'CPU %', angle: -90, position: 'insideLeft', fill: vars.color.textMuted, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: vars.color.surfaceAlt,
                border: `1px solid ${vars.color.border}`,
                borderRadius: vars.radius.sm,
                color: vars.color.text,
                fontSize: 12,
                fontFamily: vars.font.mono,
              }}
            />
            <ReferenceLine
              y={cpuThreshold}
              stroke={vars.color.danger}
              strokeDasharray="6 3"
              strokeWidth={1.5}
            />
            {switchIndices.map((idx) => (
              <ReferenceLine
                key={idx}
                x={idx}
                stroke={vars.color.accentAdaptive}
                strokeDasharray="2 2"
                strokeWidth={1}
              />
            ))}
            <Line
              type="monotone"
              dataKey="bg"
              name="Background CPU"
              stroke={vars.color.gray}
              strokeWidth={1}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total CPU"
              stroke={vars.color.navy}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
