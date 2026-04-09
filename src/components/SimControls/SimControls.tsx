import type { AdaptiveParams, TracePreset } from '../../simulation/types';
import * as s from './SimControls.css';

const PRESET_LABELS: Record<TracePreset, string> = {
  constant: 'Constant (steady load)',
  step: 'Step (CPU spike mid-run)',
  ramp: 'Ramp (linear CPU climb)',
  noisy: 'Noisy (random fluctuation)',
  burst: 'Burst (periodic spikes)',
  custom: 'Custom',
};

interface SimControlsProps {
  params: AdaptiveParams;
  onParamsChange: (params: AdaptiveParams) => void;
  tracePreset: TracePreset;
  onPresetChange: (preset: TracePreset) => void;
  traceLength: number;
  onLengthChange: (len: number) => void;
  onRun: () => void;
  onReset: () => void;
}

export function SimControls({
  params,
  onParamsChange,
  tracePreset,
  onPresetChange,
  traceLength,
  onLengthChange,
  onRun,
  onReset,
}: SimControlsProps) {
  const update = (key: keyof AdaptiveParams, value: number) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <div className={s.card}>
      <div className={s.grid}>
        {/* Left column */}
        <div className={s.column}>
          <SliderField
            label="CPU Threshold"
            unit="%"
            value={params.cpuThreshold}
            min={50}
            max={95}
            step={1}
            onChange={(v) => update('cpuThreshold', v)}
          />
          <SliderField
            label="QD Threshold"
            unit=""
            value={params.qdThreshold}
            min={1}
            max={32}
            step={1}
            onChange={(v) => update('qdThreshold', v)}
          />
          <SliderField
            label="Cooldown I/Os"
            unit=""
            value={params.cooldownIOs}
            min={1}
            max={50}
            step={1}
            onChange={(v) => update('cooldownIOs', v)}
          />
        </div>

        {/* Right column */}
        <div className={s.column}>
          <div className={s.field}>
            <span className={s.label}>Trace Preset</span>
            <select
              className={s.select}
              value={tracePreset}
              onChange={(e) => onPresetChange(e.target.value as TracePreset)}
            >
              {(Object.keys(PRESET_LABELS) as TracePreset[]).map((key) => (
                <option key={key} value={key}>
                  {PRESET_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div className={s.field}>
            <span className={s.label}>Trace Length</span>
            <input
              className={s.numberInput}
              type="number"
              min={50}
              max={5000}
              step={50}
              value={traceLength}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 50 && v <= 5000) {
                  onLengthChange(v);
                }
              }}
            />
          </div>
          <SliderField
            label="Polling Latency Gain"
            unit="us"
            value={params.pollingLatencyGain}
            min={10}
            max={80}
            step={1}
            onChange={(v) => update('pollingLatencyGain', v)}
          />
          <SliderField
            label="Polling CPU Cost"
            unit="%"
            value={params.pollingCpuCost}
            min={5}
            max={50}
            step={1}
            onChange={(v) => update('pollingCpuCost', v)}
          />
        </div>
      </div>

      <div className={s.actions}>
        <button className={s.runButton} onClick={onRun} type="button">
          Run
        </button>
        <button className={s.resetButton} onClick={onReset} type="button">
          Reset
        </button>
      </div>
    </div>
  );
}

/* ---- internal slider field ---- */

interface SliderFieldProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function SliderField({ label, unit, value, min, max, step, onChange }: SliderFieldProps) {
  return (
    <div className={s.field}>
      <div className={s.labelRow}>
        <span className={s.label}>{label}</span>
        <span className={s.valueDisplay}>
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        className={s.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
