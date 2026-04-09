import { useState, useEffect, useCallback, useRef } from 'react';
import { SimControls } from '../components/SimControls/SimControls';
import { SimStats } from '../components/SimStats/SimStats';
import { SimChart } from '../components/SimChart/SimChart';
import { SimPlayback } from '../components/SimPlayback/SimPlayback';
import { SimStepLog } from '../components/SimStepLog/SimStepLog';
import { SimRuleBox } from '../components/SimRuleBox/SimRuleBox';
import { generateTrace } from '../simulation/traces';
import { runEmulation } from '../simulation/emulator';
import { DEFAULT_PARAMS } from '../simulation/types';
import type { AdaptiveParams, TracePreset, SimResult } from '../simulation/types';
import * as s from './emulator.css';

export default function Emulator() {
  const [params, setParams] = useState<AdaptiveParams>(DEFAULT_PARAMS);
  const [tracePreset, setTracePreset] = useState<TracePreset>('step');
  const [traceLength, setTraceLength] = useState(500);
  const [result, setResult] = useState<SimResult | null>(null);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = result?.steps ?? [];

  const handleRun = useCallback(() => {
    const trace = generateTrace(tracePreset, traceLength);
    const emResult = runEmulation(trace, params);
    setResult(emResult);
    setPosition(0);
    setPlaying(true);
  }, [tracePreset, traceLength, params]);

  const handleReset = useCallback(() => {
    setResult(null);
    setPosition(0);
    setPlaying(false);
  }, []);

  const handlePlayToggle = useCallback(() => {
    setPlaying((prev) => {
      if (!prev && position >= steps.length) {
        setPosition(0);
      }
      return !prev;
    });
  }, [position, steps.length]);

  useEffect(() => {
    if (playing && steps.length > 0) {
      intervalRef.current = setInterval(() => {
        setPosition((prev) => {
          const next = prev + 3;
          if (next >= steps.length) {
            setPlaying(false);
            return steps.length;
          }
          return next;
        });
      }, 30);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, steps.length]);

  const visibleRange: [number, number] = [0, position];

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>Adaptive I/O Emulator</h1>
        <p className={s.subtitle}>
          피드백 루프 포함 — 모드 선택이 CPU 사용률과 latency에 영향을 미친다
        </p>
      </header>

      <div className={s.section}>
        <SimControls
          params={params}
          onParamsChange={setParams}
          tracePreset={tracePreset}
          onPresetChange={setTracePreset}
          traceLength={traceLength}
          onLengthChange={setTraceLength}
          onRun={handleRun}
          onReset={handleReset}
        />
      </div>

      <div className={s.section}>
        <SimRuleBox steps={steps} position={position} />
      </div>

      <div className={s.section}>
        <SimStats result={result} />
      </div>

      {steps.length > 0 && (
        <>
          <div className={s.section}>
            <SimPlayback
              total={steps.length}
              position={position}
              onPositionChange={setPosition}
              playing={playing}
              onPlayToggle={handlePlayToggle}
            />
          </div>

          <div className={s.section}>
            <SimChart
              steps={steps}
              visibleRange={visibleRange}
              cpuThreshold={params.cpuThreshold}
            />
          </div>

          <div className={s.section}>
            <SimStepLog steps={steps} position={position} />
          </div>
        </>
      )}
    </div>
  );
}
