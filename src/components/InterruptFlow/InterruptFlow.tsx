import { vars } from '../../styles/theme.css';
import * as s from './InterruptFlow.css';

const TEXT = vars.color.text;
const MUTED = vars.color.textMuted;
const BORDER = vars.color.border;
const SURFACE = vars.color.surface;
const SURFACE_ALT = vars.color.surfaceAlt;
const ACCENT = vars.color.accentInterrupt;
const ACCENT_DEVICE = vars.color.accentPolling;
const WARN = vars.color.accentAdaptive;
const GRAY = vars.color.gray;

export function InterruptFlow() {
  return (
    <figure className={s.figure}>
      <svg
        className={s.svg}
        viewBox="0 0 720 620"
        role="img"
        aria-label="interrupt 기반 I/O 한 사이클의 단계 흐름도"
      >
        <defs>
          <marker
            id="if-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={MUTED} />
          </marker>
          <marker
            id="if-arrow-accent"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT} />
          </marker>
        </defs>

        {/* Lane headers */}
        <g fontSize="14" fontWeight="600" fill={TEXT} textAnchor="middle">
          <text x="120" y="28">User Process</text>
          <text x="360" y="28">Kernel</text>
          <text x="600" y="28">Device (NVMe)</text>
        </g>

        {/* Lane backgrounds */}
        <g>
          <rect x="20" y="50" width="200" height="555" rx="8" fill={SURFACE} stroke={BORDER} />
          <rect x="240" y="50" width="240" height="555" rx="8" fill={SURFACE} stroke={BORDER} />
          <rect x="500" y="50" width="200" height="555" rx="8" fill={SURFACE} stroke={BORDER} />
        </g>

        {/* Highlight: wake-up cost zone (steps 4..7) */}
        <rect
          x="22"
          y="378"
          width="676"
          height="222"
          rx="6"
          fill={WARN}
          opacity="0.07"
          pointerEvents="none"
        />

        {/* Step 0: read() */}
        <g>
          <rect x="40" y="80" width="160" height="40" rx="6" fill={SURFACE_ALT} stroke={ACCENT} strokeWidth="1.5" />
          <text x="120" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            read() 호출
          </text>
        </g>

        {/* Arrow: user → kernel (syscall) */}
        <line x1="200" y1="100" x2="262" y2="150" stroke={MUTED} strokeWidth="1.5" markerEnd="url(#if-arrow)" />
        <text x="232" y="118" textAnchor="middle" fontSize="11" fontStyle="italic" fill={MUTED}>
          syscall
        </text>

        {/* Step 1: kernel submit */}
        <g>
          <rect x="260" y="140" width="200" height="40" rx="6" fill={SURFACE_ALT} stroke={ACCENT} strokeWidth="1.5" />
          <text x="360" y="160" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            블록 레이어 → 디바이스 명령
          </text>
        </g>

        {/* Arrow: kernel → device (submit) */}
        <line x1="460" y1="160" x2="522" y2="200" stroke={MUTED} strokeWidth="1.5" markerEnd="url(#if-arrow)" />
        <text x="492" y="178" textAnchor="middle" fontSize="11" fontStyle="italic" fill={MUTED}>
          submit
        </text>

        {/* Step 2: parallel zone — user sleeps, other tasks run, device works */}
        <g>
          {/* User: sleeping */}
          <rect
            x="40"
            y="195"
            width="160"
            height="170"
            rx="6"
            fill={SURFACE}
            stroke={GRAY}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="120" y="280" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontStyle="italic" fill={MUTED}>
            잠듦 (blocked)
          </text>

          {/* Kernel: schedule out + other tasks */}
          <rect x="260" y="195" width="200" height="170" rx="6" fill={SURFACE_ALT} stroke={BORDER} />
          <text x="360" y="270" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            schedule out
          </text>
          <text x="360" y="290" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={MUTED}>
            다른 task가 CPU 사용
          </text>

          {/* Device: processing */}
          <rect x="520" y="195" width="160" height="170" rx="6" fill={SURFACE_ALT} stroke={ACCENT_DEVICE} strokeWidth="1.5" />
          <text x="600" y="280" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            디바이스 처리 중
          </text>
        </g>

        {/* Step 3: Device done */}
        <g>
          <rect x="520" y="385" width="160" height="36" rx="6" fill={SURFACE_ALT} stroke={ACCENT_DEVICE} strokeWidth="1.5" />
          <text x="600" y="403" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            완료
          </text>
        </g>

        {/* Arrow: device → kernel (interrupt) */}
        <line x1="520" y1="420" x2="462" y2="446" stroke={ACCENT} strokeWidth="2" markerEnd="url(#if-arrow-accent)" />
        <text x="491" y="425" textAnchor="middle" fontSize="11" fontWeight="600" fontStyle="italic" fill={ACCENT}>
          interrupt
        </text>

        {/* Step 4: ISR */}
        <g>
          <rect x="260" y="438" width="200" height="34" rx="6" fill={SURFACE_ALT} stroke={ACCENT} strokeWidth="1.5" />
          <text x="360" y="455" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            ISR 실행 (top + bottom half)
          </text>
        </g>

        {/* Step 5: wake_up + ready queue */}
        <g>
          <rect x="260" y="481" width="200" height="34" rx="6" fill={SURFACE_ALT} stroke={ACCENT} strokeWidth="1.5" />
          <text x="360" y="498" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            wake_up → ready queue
          </text>
        </g>

        {/* Step 6: scheduler pick */}
        <g>
          <rect x="260" y="524" width="200" height="34" rx="6" fill={SURFACE_ALT} stroke={ACCENT} strokeWidth="1.5" />
          <text x="360" y="541" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            scheduler가 다시 pick
          </text>
        </g>

        {/* Arrow: kernel → user (resume) */}
        <line x1="260" y1="552" x2="202" y2="578" stroke={ACCENT} strokeWidth="2" markerEnd="url(#if-arrow-accent)" />
        <text x="231" y="557" textAnchor="middle" fontSize="11" fontWeight="600" fontStyle="italic" fill={ACCENT}>
          resume
        </text>

        {/* Step 7: read() returns */}
        <g>
          <rect x="40" y="568" width="160" height="34" rx="6" fill={SURFACE_ALT} stroke={ACCENT} strokeWidth="1.5" />
          <text x="120" y="585" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="500" fill={TEXT}>
            read() 리턴
          </text>
        </g>
      </svg>
      <figcaption className={s.caption}>
        그림 1. interrupt 기반 I/O 한 사이클의 단계. 디바이스가 완료된 시점부터 read()가 리턴할 때까지
        ISR, wake_up, ready queue 등록, 스케줄러 pick의 단계가 차례로 누적되는데, 음영 처리된 영역의
        합산 비용이 본문에서 말하는 인터럽트 비용 1–5μs다.
      </figcaption>
    </figure>
  );
}
