import { vars } from '../../styles/theme.css';
import * as s from './IoApiMatrix.css';

const TEXT = vars.color.text;
const MUTED = vars.color.textMuted;
const BORDER = vars.color.border;
const SURFACE = vars.color.surface;
const SURFACE_ALT = vars.color.surfaceAlt;
const ACCENT_OK = vars.color.accentPolling;     // 초록: 지원
const ACCENT_NO = vars.color.danger;            // 빨강: 미지원
const ACCENT_PARTIAL = vars.color.accentAdaptive; // 노랑: 부분 지원
const ACCENT_HIGHLIGHT = vars.color.accentInterrupt;

type Status = 'ok' | 'no' | 'partial';

interface Cell {
  status: Status;
  text: string;
}

interface Row {
  tool: string;
  toolNote: string;
  highlight?: boolean;
  cells: Cell[];
}

const COLUMNS = ['디스크 fd', '네트워크 fd', 'true async\n(completion 기반)', 'syscall 없이\nbatch'];

const ROWS: Row[] = [
  {
    tool: 'read() / write()',
    toolNote: '동기 시스템콜',
    cells: [
      { status: 'ok', text: '지원' },
      { status: 'ok', text: '지원' },
      { status: 'no', text: '동기 blocking' },
      { status: 'no', text: '호출마다 1회' },
    ],
  },
  {
    tool: 'epoll',
    toolNote: 'readiness 알림',
    cells: [
      { status: 'no', text: '소켓 전용' },
      { status: 'ok', text: 'C10K의 표준' },
      { status: 'partial', text: '준비만 알림' },
      { status: 'no', text: '이벤트마다 read' },
    ],
  },
  {
    tool: 'aio (KAIO)',
    toolNote: '디스크 비동기',
    cells: [
      { status: 'partial', text: 'O_DIRECT 강제' },
      { status: 'no', text: '소켓 X' },
      { status: 'ok', text: '진짜 async' },
      { status: 'no', text: 'submit/harvest' },
    ],
  },
  {
    tool: 'io_uring',
    toolNote: '통합 비동기',
    highlight: true,
    cells: [
      { status: 'ok', text: 'O_DIRECT 선택' },
      { status: 'ok', text: '소켓·파이프·타이머' },
      { status: 'ok', text: 'completion 기반' },
      { status: 'ok', text: 'SQPOLL이면 0회' },
    ],
  },
];

// Layout
const W = 720;
const TOOL_COL_W = 160;
const CELL_W = (W - TOOL_COL_W) / 4;
const HEADER_H = 60;
const ROW_H = 56;
const TOP_PAD = 20;
const H = TOP_PAD + HEADER_H + ROWS.length * ROW_H + 20;

function statusColor(status: Status): string {
  if (status === 'ok') return ACCENT_OK;
  if (status === 'no') return ACCENT_NO;
  return ACCENT_PARTIAL;
}

function statusBg(status: Status): { fill: string; opacity: number } {
  if (status === 'ok') return { fill: ACCENT_OK, opacity: 0.10 };
  if (status === 'no') return { fill: ACCENT_NO, opacity: 0.07 };
  return { fill: ACCENT_PARTIAL, opacity: 0.10 };
}

function statusGlyph(status: Status): string {
  if (status === 'ok') return '✓';
  if (status === 'no') return '✗';
  return '△';
}

export function IoApiMatrix() {
  return (
    <figure className={s.figure}>
      <svg
        className={s.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="read/write, epoll, aio, io_uring의 능력 비교 매트릭스"
      >
        {/* Header row */}
        <g>
          <rect
            x="0"
            y={TOP_PAD}
            width={W}
            height={HEADER_H}
            fill={SURFACE_ALT}
            stroke={BORDER}
            strokeWidth="1"
          />
          {/* Tool col header */}
          <text
            x={TOOL_COL_W / 2}
            y={TOP_PAD + HEADER_H / 2}
            fontSize="13"
            fontWeight="700"
            fill={TEXT}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            인터페이스
          </text>
          {/* Capability headers */}
          {COLUMNS.map((col, i) => {
            const x = TOOL_COL_W + i * CELL_W + CELL_W / 2;
            const lines = col.split('\n');
            return (
              <text
                key={col}
                x={x}
                y={TOP_PAD + HEADER_H / 2}
                fontSize="12"
                fontWeight="600"
                fill={TEXT}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {lines.length === 1 ? (
                  col
                ) : (
                  <>
                    <tspan x={x} dy="-0.55em">{lines[0]}</tspan>
                    <tspan x={x} dy="1.2em" fontSize="11" fill={MUTED}>
                      {lines[1]}
                    </tspan>
                  </>
                )}
              </text>
            );
          })}
        </g>

        {/* Vertical separators in header */}
        {[0, 1, 2, 3].map((i) => {
          const x = TOOL_COL_W + i * CELL_W;
          return (
            <line
              key={`sep-${i}`}
              x1={x}
              y1={TOP_PAD}
              x2={x}
              y2={TOP_PAD + HEADER_H + ROWS.length * ROW_H}
              stroke={BORDER}
              strokeWidth="1"
            />
          );
        })}

        {/* Data rows */}
        {ROWS.map((row, rowIdx) => {
          const y = TOP_PAD + HEADER_H + rowIdx * ROW_H;
          const rowFill = row.highlight ? ACCENT_HIGHLIGHT : SURFACE;
          const rowFillOpacity = row.highlight ? 0.07 : 1;

          return (
            <g key={row.tool}>
              {/* Row background (for highlight) */}
              {row.highlight && (
                <rect
                  x="0"
                  y={y}
                  width={W}
                  height={ROW_H}
                  fill={rowFill}
                  fillOpacity={rowFillOpacity}
                />
              )}

              {/* Bottom border */}
              <line x1="0" y1={y + ROW_H} x2={W} y2={y + ROW_H} stroke={BORDER} strokeWidth="1" />

              {/* Tool name + note */}
              <text
                x="14"
                y={y + ROW_H / 2 - 7}
                fontSize="13"
                fontWeight="700"
                fill={row.highlight ? ACCENT_HIGHLIGHT : TEXT}
                dominantBaseline="middle"
              >
                {row.tool}
              </text>
              <text
                x="14"
                y={y + ROW_H / 2 + 11}
                fontSize="11"
                fill={MUTED}
                fontStyle="italic"
                dominantBaseline="middle"
              >
                {row.toolNote}
              </text>

              {/* Capability cells */}
              {row.cells.map((cell, cellIdx) => {
                const cellX = TOOL_COL_W + cellIdx * CELL_W;
                const bg = statusBg(cell.status);
                const color = statusColor(cell.status);

                return (
                  <g key={cellIdx}>
                    <rect
                      x={cellX + 1}
                      y={y + 4}
                      width={CELL_W - 2}
                      height={ROW_H - 8}
                      rx="4"
                      fill={bg.fill}
                      fillOpacity={bg.opacity}
                    />
                    {/* Status glyph */}
                    <text
                      x={cellX + 22}
                      y={y + ROW_H / 2}
                      fontSize="18"
                      fontWeight="700"
                      fill={color}
                      dominantBaseline="middle"
                      textAnchor="middle"
                    >
                      {statusGlyph(cell.status)}
                    </text>
                    {/* Status text */}
                    <text
                      x={cellX + 40}
                      y={y + ROW_H / 2}
                      fontSize="11"
                      fill={TEXT}
                      dominantBaseline="middle"
                    >
                      {cell.text}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Outer border */}
        <rect
          x="0"
          y={TOP_PAD}
          width={W}
          height={HEADER_H + ROWS.length * ROW_H}
          fill="none"
          stroke={BORDER}
          strokeWidth="1"
        />
      </svg>
      <figcaption className={s.caption}>
        그림 6. 네 가지 I/O 인터페이스의 능력 비교. 각 도구는 두세 개 능력만 충족하며,
        특히 "디스크와 네트워크를 모두 지원하는 진짜 비동기"는 io_uring 이전엔 존재하지 않았다.
        epoll은 네트워크에 강하지만 readiness 모델이라 매 이벤트마다 별도 read가 필요하고,
        aio는 진짜 비동기지만 디스크 전용에 O_DIRECT 강제라는 함정이 있다. io_uring은 두 도구의
        약점을 동시에 푼 단일 인터페이스다.
      </figcaption>
    </figure>
  );
}
