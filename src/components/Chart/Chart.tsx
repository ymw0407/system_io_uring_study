import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { vars } from '../../styles/theme.css';
import * as s from './Chart.css';

const COLOR_MAP: Record<string, string> = {
  interrupt: vars.color.accentInterrupt,
  polling: vars.color.accentPolling,
  adaptive: vars.color.accentAdaptive,
};

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
}

interface ChartProps {
  kind: 'line' | 'bar';
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesConfig[];
  xLabel?: string;
  yLabel?: string;
  caption?: string;
  yScale?: 'linear' | 'log';
}

export function Chart({ kind, data, xKey, series, xLabel, yLabel, caption, yScale = 'linear' }: ChartProps) {
  const resolveColor = (c: string) => COLOR_MAP[c] ?? c;

  const chartContent = kind === 'line' ? (
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={vars.color.border} />
      <XAxis
        dataKey={xKey}
        stroke={vars.color.textMuted}
        tick={{ fill: vars.color.textMuted, fontSize: 12 }}
        label={xLabel ? { value: xLabel, position: 'bottom', fill: vars.color.textMuted, fontSize: 13 } : undefined}
      />
      <YAxis
        stroke={vars.color.textMuted}
        tick={{ fill: vars.color.textMuted, fontSize: 12 }}
        scale={yScale}
        domain={yScale === 'log' ? ['auto', 'auto'] : undefined}
        allowDataOverflow={yScale === 'log'}
        label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: vars.color.textMuted, fontSize: 13 } : undefined}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: vars.color.surfaceAlt,
          border: `1px solid ${vars.color.border}`,
          borderRadius: vars.radius.sm,
          color: vars.color.text,
          fontSize: 13,
        }}
      />
      <Legend verticalAlign="top" height={36} />
      {series.map((sr) => (
        <Line
          key={sr.key}
          type="monotone"
          dataKey={sr.key}
          name={sr.label}
          stroke={resolveColor(sr.color)}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  ) : (
    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={vars.color.border} />
      <XAxis
        dataKey={xKey}
        stroke={vars.color.textMuted}
        tick={{ fill: vars.color.textMuted, fontSize: 12 }}
        label={xLabel ? { value: xLabel, position: 'bottom', fill: vars.color.textMuted, fontSize: 13 } : undefined}
      />
      <YAxis
        stroke={vars.color.textMuted}
        tick={{ fill: vars.color.textMuted, fontSize: 12 }}
        scale={yScale}
        domain={yScale === 'log' ? ['auto', 'auto'] : undefined}
        allowDataOverflow={yScale === 'log'}
        label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: vars.color.textMuted, fontSize: 13 } : undefined}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: vars.color.surfaceAlt,
          border: `1px solid ${vars.color.border}`,
          borderRadius: vars.radius.sm,
          color: vars.color.text,
          fontSize: 13,
        }}
      />
      <Legend verticalAlign="top" height={36} />
      {series.map((sr) => (
        <Bar
          key={sr.key}
          dataKey={sr.key}
          name={sr.label}
          fill={resolveColor(sr.color)}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </BarChart>
  );

  return (
    <div className={s.wrapper}>
      <ResponsiveContainer width="100%" height={360}>
        {chartContent}
      </ResponsiveContainer>
      {caption && <p className={s.caption}>{caption}</p>}
    </div>
  );
}
