import type { SimResult } from '../../simulation/types';
import * as s from './SimStats.css';

interface SimStatsProps {
  result: SimResult | null;
}

export function SimStats({ result }: SimStatsProps) {
  return (
    <div className={s.grid}>
      <div className={s.card}>
        <span className={s.label}>Avg Latency (Adaptive)</span>
        {result ? (
          <span className={s.valueAdaptive}>
            {result.avgLatencyAdaptive.toFixed(1)}
            <span className={s.unit}>us</span>
          </span>
        ) : (
          <span className={s.placeholder}>--</span>
        )}
      </div>

      <div className={s.card}>
        <span className={s.label}>Avg Latency (Interrupt)</span>
        {result ? (
          <span className={s.valueInterrupt}>
            {result.avgLatencyInterrupt.toFixed(1)}
            <span className={s.unit}>us</span>
          </span>
        ) : (
          <span className={s.placeholder}>--</span>
        )}
      </div>

      <div className={s.card}>
        <span className={s.label}>Avg Latency (Polling)</span>
        {result ? (
          <span className={s.valuePolling}>
            {result.avgLatencyPolling.toFixed(1)}
            <span className={s.unit}>us</span>
          </span>
        ) : (
          <span className={s.placeholder}>--</span>
        )}
      </div>

      <div className={s.card}>
        <span className={s.label}>Mode Switches</span>
        {result ? (
          <span className={s.value}>{result.switchCount}</span>
        ) : (
          <span className={s.placeholder}>--</span>
        )}
      </div>

      <div className={s.card}>
        <span className={s.label}>Polling Ratio</span>
        {result ? (
          <span className={s.valuePolling}>
            {(result.pollingRatio * 100).toFixed(1)}
            <span className={s.unit}>%</span>
          </span>
        ) : (
          <span className={s.placeholder}>--</span>
        )}
      </div>
    </div>
  );
}
