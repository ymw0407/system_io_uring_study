import { useMemo } from 'react';
import type { SimStep } from '../../simulation/types';
import * as s from './SimStepLog.css';

interface SimStepLogProps {
  steps: SimStep[];
  position: number;
}

const LOG_SIZE = 15;

export function SimStepLog({ steps, position }: SimStepLogProps) {
  const visibleSteps = useMemo(() => {
    const end = Math.min(position, steps.length);
    const start = Math.max(0, end - LOG_SIZE);
    return steps.slice(start, end);
  }, [steps, position]);

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <span className={s.dot} />
        <span className={s.dot} />
        <span className={s.dot} />
        <span>Step Log</span>
      </div>
      {visibleSteps.length === 0 ? (
        <div className={s.empty}>Run simulation to see step log</div>
      ) : (
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>I/O#</th>
                <th className={s.th}>Device(us)</th>
                <th className={s.th}>App(us)</th>
                <th className={s.th}>CPU%</th>
                <th className={s.th}>QD</th>
                <th className={s.th}>Mode</th>
                <th className={s.th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {visibleSteps.map((step) => (
                <tr
                  key={step.index}
                  className={step.switched ? s.rowSwitched : s.rowDefault}
                >
                  <td className={s.td}>{step.index}</td>
                  <td className={s.td}>{step.deviceLatency.toFixed(1)}</td>
                  <td className={s.td}>{step.appLatency.toFixed(1)}</td>
                  <td className={s.td}>{step.totalCpu.toFixed(1)}</td>
                  <td className={s.td}>{step.currentQd}</td>
                  <td className={s.td}>
                    <span
                      className={
                        step.mode === 'polling'
                          ? s.modePolling
                          : s.modeInterrupt
                      }
                    >
                      {step.mode}
                    </span>
                  </td>
                  <td className={s.td}>
                    <span className={s.reasonText}>{step.reason}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
