import { vars } from '../../styles/theme.css';
import * as s from './CostAxis.css';

const TEXT = vars.color.text;
const MUTED = vars.color.textMuted;
const BORDER = vars.color.border;
const SURFACE = vars.color.surface;
const SURFACE_ALT = vars.color.surfaceAlt;
const ACCENT_IO_URING = vars.color.accentInterrupt;     // 파랑: io_uring
const ACCENT_PAS = vars.color.accentAdaptive;            // 노랑: PAS/DPAS
const GRAY = vars.color.gray;

export function CostAxis() {
  return (
    <figure className={s.figure}>
      <svg
        className={s.svg}
        viewBox="0 0 720 380"
        role="img"
        aria-label="I/O latency를 세 단계로 분해하고 io_uring과 PAS/DPAS가 각각 어느 단계를 푸는지 표시"
      >
        <defs>
          <marker
            id="ca-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={MUTED} />
          </marker>
        </defs>

        {/* Title bar */}
        <text x="360" y="28" fontSize="13" fontStyle="italic" fill={MUTED} textAnchor="middle">
          한 번의 I/O latency = ① 제출 측 + ② 디바이스 작업 + ③ 완료 측
        </text>

        {/* === Stage boxes === */}
        {/* Stage 1: 제출 측 */}
        <g>
          <rect x="20" y="60" width="200" height="120" rx="8" fill={SURFACE} stroke={ACCENT_IO_URING} strokeWidth="2" />
          <text x="120" y="85" fontSize="13" fontWeight="700" fill={ACCENT_IO_URING} textAnchor="middle" dominantBaseline="middle">
            ① 제출 측
          </text>
          <line x1="40" y1="100" x2="200" y2="100" stroke={BORDER} strokeWidth="1" />
          <text x="120" y="120" fontSize="12" fontWeight="600" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            user → kernel
          </text>
          <text x="120" y="140" fontSize="11" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            syscall, mode switch
          </text>
          <text x="120" y="158" fontSize="11" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            인자 / 결과 복사
          </text>
        </g>

        {/* Arrow 1 → 2 */}
        <line x1="225" y1="120" x2="255" y2="120" stroke={MUTED} strokeWidth="1.5" markerEnd="url(#ca-arrow)" />

        {/* Stage 2: 디바이스 작업 */}
        <g>
          <rect x="260" y="60" width="200" height="120" rx="8" fill={SURFACE_ALT} stroke={GRAY} strokeWidth="2" strokeDasharray="6 4" />
          <text x="360" y="85" fontSize="13" fontWeight="700" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            ② 디바이스 작업
          </text>
          <line x1="280" y1="100" x2="440" y2="100" stroke={BORDER} strokeWidth="1" />
          <text x="360" y="120" fontSize="12" fontWeight="600" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            NVMe 처리 시간
          </text>
          <text x="360" y="140" fontSize="11" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            80–120 μs (4KB randread)
          </text>
          <text x="360" y="158" fontSize="11" fill={MUTED} textAnchor="middle" dominantBaseline="middle" fontStyle="italic">
            (소프트웨어가 못 만짐)
          </text>
        </g>

        {/* Arrow 2 → 3 */}
        <line x1="465" y1="120" x2="495" y2="120" stroke={MUTED} strokeWidth="1.5" markerEnd="url(#ca-arrow)" />

        {/* Stage 3: 완료 측 */}
        <g>
          <rect x="500" y="60" width="200" height="120" rx="8" fill={SURFACE} stroke={ACCENT_PAS} strokeWidth="2" />
          <text x="600" y="85" fontSize="13" fontWeight="700" fill={ACCENT_PAS} textAnchor="middle" dominantBaseline="middle">
            ③ 완료 측
          </text>
          <line x1="520" y1="100" x2="680" y2="100" stroke={BORDER} strokeWidth="1" />
          <text x="600" y="120" fontSize="12" fontWeight="600" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            깨어나는 타이밍
          </text>
          <text x="600" y="140" fontSize="11" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            wake_up, scheduler pick
          </text>
          <text x="600" y="158" fontSize="11" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            ISR or self-timer
          </text>
        </g>

        {/* === Bracket connectors === */}
        {/* Stage 1 bracket down to io_uring tool */}
        <path d="M 120 185 L 120 215" stroke={ACCENT_IO_URING} strokeWidth="2" />
        {/* Stage 3 bracket down to PAS tool */}
        <path d="M 600 185 L 600 215" stroke={ACCENT_PAS} strokeWidth="2" />
        {/* Stage 2 bracket down to immutable label */}
        <path d="M 360 185 L 360 215" stroke={GRAY} strokeWidth="1.5" strokeDasharray="3 3" />

        {/* === Tool boxes === */}
        {/* io_uring */}
        <g>
          <rect x="20" y="220" width="200" height="130" rx="8" fill={ACCENT_IO_URING} fillOpacity="0.08" stroke={ACCENT_IO_URING} strokeWidth="1.5" />
          <text x="120" y="245" fontSize="14" fontWeight="700" fill={ACCENT_IO_URING} textAnchor="middle" dominantBaseline="middle">
            io_uring
          </text>
          <text x="120" y="268" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            공유 링 버퍼 (mmap)
          </text>
          <text x="120" y="285" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            batching · zero-copy
          </text>
          <text x="120" y="302" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            SQPOLL = syscall 0회
          </text>
          <text x="120" y="328" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle" fontStyle="italic">
            거주: io_uring/ 서브시스템
          </text>
        </g>

        {/* immutable label */}
        <g>
          <rect x="260" y="220" width="200" height="130" rx="8" fill={SURFACE_ALT} stroke={GRAY} strokeWidth="1" strokeDasharray="4 4" />
          <text x="360" y="270" fontSize="13" fontWeight="600" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            (소프트웨어로
          </text>
          <text x="360" y="290" fontSize="13" fontWeight="600" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
            만질 수 없음)
          </text>
          <text x="360" y="320" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle" fontStyle="italic">
            디바이스 자체의 latency
          </text>
        </g>

        {/* PAS/DPAS */}
        <g>
          <rect x="500" y="220" width="200" height="130" rx="8" fill={ACCENT_PAS} fillOpacity="0.10" stroke={ACCENT_PAS} strokeWidth="1.5" />
          <text x="600" y="245" fontSize="14" fontWeight="700" fill={ACCENT_PAS} textAnchor="middle" dominantBaseline="middle">
            PAS / DPAS
          </text>
          <text x="600" y="268" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            sleep 길이 학습
          </text>
          <text x="600" y="285" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            UNDER / OVER 피드백
          </text>
          <text x="600" y="302" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
            모드 전환 (PAS·CP·OL·INT)
          </text>
          <text x="600" y="328" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle" fontStyle="italic">
            거주: block/blk-mq.c
          </text>
        </g>
      </svg>
      <figcaption className={s.caption}>
        그림 5. io_uring과 PAS/DPAS가 푸는 비용의 축. 한 번의 I/O latency를 세 단계로 분해하면,
        io_uring은 ① 제출 측(사용자/커널 통신 비용)을 친다. PAS/DPAS는 ③ 완료 측(사용자 task가
        언제 깨어나 디바이스 CQ를 확인할지의 타이밍)을 친다. ② 디바이스 작업 자체는 둘 다 못 만진다.
        두 도구는 만지는 변수가 다르고 거주하는 커널 서브시스템도 다르므로 서로 충돌 없이 합쳐지며,
        IOPOLL 모드의 io_uring이 두 시스템이 만나는 지점이다.
      </figcaption>
    </figure>
  );
}
