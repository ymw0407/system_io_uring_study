import { vars } from '../../styles/theme.css';
import * as s from './LatencyInversion.css';

const TEXT = vars.color.text;
const MUTED = vars.color.textMuted;
const BORDER = vars.color.border;
const SURFACE_ALT = vars.color.surfaceAlt;
const ACCENT = vars.color.accentInterrupt;
const GRAY = vars.color.gray;

interface Tier {
  label: string;
  deviceUs: number;
  interruptUs: number;
  deviceLabel: string;
  interruptLabel: string;
}

// 본문 범위의 대표값. 인터럽트 비용은 1–5μs 중 상단(5μs)으로 시각화.
const TIERS: Tier[] = [
  { label: 'HDD',      deviceUs: 10000, interruptUs: 5, deviceLabel: '10 ms',  interruptLabel: '5 μs' },
  { label: 'SATA SSD', deviceUs: 300,   interruptUs: 5, deviceLabel: '300 μs', interruptLabel: '5 μs' },
  { label: 'NVMe',     deviceUs: 100,   interruptUs: 5, deviceLabel: '100 μs', interruptLabel: '5 μs' },
];

// SVG layout
const W = 720;
const ROW_H = 70;
const BAR_H = 32;
const HEADER_Y = 30;
const FIRST_ROW_Y = 80;
const H = FIRST_ROW_Y + TIERS.length * ROW_H + 20;

const LABEL_X = 20;
const BAR_X = 130;
const BAR_W = 380;
const ANNOT_X = 525;

export function LatencyInversion() {
  return (
    <figure className={s.figure}>
      <svg
        className={s.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="HDD, SATA SSD, NVMe의 디바이스 시간 대비 인터럽트 비용 비율 비교"
      >
        {/* Legend */}
        <g>
          <rect x={LABEL_X} y={HEADER_Y - 14} width="14" height="14" rx="3" fill={GRAY} />
          <text x={LABEL_X + 22} y={HEADER_Y - 2} fontSize="13" fill={TEXT}>
            디바이스 시간
          </text>
          <rect x={LABEL_X + 130} y={HEADER_Y - 14} width="14" height="14" rx="3" fill={ACCENT} />
          <text x={LABEL_X + 152} y={HEADER_Y - 2} fontSize="13" fill={TEXT}>
            인터럽트 비용 (1–5 μs)
          </text>
          <text x={W - 20} y={HEADER_Y - 2} fontSize="12" fill={MUTED} textAnchor="end" fontStyle="italic">
            전체 I/O 시간을 100%로 정규화
          </text>
        </g>

        {/* Header underline */}
        <line x1={LABEL_X} y1={HEADER_Y + 12} x2={W - 20} y2={HEADER_Y + 12} stroke={BORDER} strokeWidth="1" />

        {TIERS.map((tier, i) => {
          const total = tier.deviceUs + tier.interruptUs;
          const deviceShare = tier.deviceUs / total;
          const interruptShare = tier.interruptUs / total;
          const deviceWidth = deviceShare * BAR_W;
          const interruptWidth = interruptShare * BAR_W;
          const percent = (interruptShare * 100).toFixed(2);
          const rowY = FIRST_ROW_Y + i * ROW_H;
          const barY = rowY;
          const labelY = rowY + BAR_H / 2;

          return (
            <g key={tier.label}>
              {/* Device label */}
              <text
                x={LABEL_X}
                y={labelY}
                fontSize="14"
                fontWeight="600"
                fill={TEXT}
                dominantBaseline="middle"
              >
                {tier.label}
              </text>

              {/* Bar background (faint) */}
              <rect
                x={BAR_X}
                y={barY}
                width={BAR_W}
                height={BAR_H}
                rx="4"
                fill={SURFACE_ALT}
                stroke={BORDER}
                strokeWidth="1"
              />

              {/* Device segment */}
              <rect
                x={BAR_X}
                y={barY}
                width={deviceWidth}
                height={BAR_H}
                rx="4"
                fill={GRAY}
              />

              {/* Interrupt segment (right side) */}
              {interruptWidth >= 0.5 && (
                <rect
                  x={BAR_X + deviceWidth}
                  y={barY}
                  width={interruptWidth}
                  height={BAR_H}
                  fill={ACCENT}
                />
              )}

              {/* Right-side annotation */}
              <text
                x={ANNOT_X}
                y={labelY - 6}
                fontSize="12"
                fill={TEXT}
                dominantBaseline="middle"
              >
                <tspan fill={MUTED}>device </tspan>
                <tspan fontWeight="600">{tier.deviceLabel}</tspan>
                <tspan fill={MUTED}> · interrupt </tspan>
                <tspan fontWeight="600">{tier.interruptLabel}</tspan>
              </text>
              <text
                x={ANNOT_X}
                y={labelY + 10}
                fontSize="12"
                fill={ACCENT}
                fontWeight="700"
                dominantBaseline="middle"
              >
                인터럽트 비율 {percent}%
              </text>

              {/* Tiny pointer for HDD (where slice is invisible) */}
              {interruptWidth < 1 && (
                <g>
                  <line
                    x1={BAR_X + BAR_W}
                    y1={barY - 4}
                    x2={BAR_X + BAR_W + 6}
                    y2={barY - 12}
                    stroke={ACCENT}
                    strokeWidth="1"
                  />
                  <text
                    x={BAR_X + BAR_W + 8}
                    y={barY - 14}
                    fontSize="10"
                    fill={ACCENT}
                    fontStyle="italic"
                  >
                    (이 척도에서 보이지 않음)
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className={s.caption}>
        그림 2. 디바이스 시대별 인터럽트 비용 비율. 각 막대는 한 번의 I/O 전체 시간을 100%로
        정규화한 것으로, 회색이 디바이스 처리 시간, 파란색이 인터럽트 비용이다. 인터럽트 비용
        자체는 시대를 거쳐 거의 일정한 1–5 마이크로초인데, 디바이스 시간이 줄어들면서 그 비율이
        HDD의 0.05%에서 NVMe의 4.76%로 약 100배 증가했다. 본문이 말하는 지연 역전은 이 비율
        변화를 가리킨다. 각 디바이스는 본문 범위의 대표값(HDD 10 ms, SATA SSD 300 μs, NVMe 100 μs)을
        사용했고, 인터럽트 비용은 보수적으로 5 μs(범위 상단)로 잡았다.
      </figcaption>
    </figure>
  );
}
