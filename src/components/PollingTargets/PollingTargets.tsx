import { vars } from '../../styles/theme.css';
import * as s from './PollingTargets.css';

const TEXT = vars.color.text;
const MUTED = vars.color.textMuted;
const BORDER = vars.color.border;
const SURFACE = vars.color.surface;
const SURFACE_ALT = vars.color.surfaceAlt;
const ACCENT_INTERRUPT = vars.color.accentInterrupt;
const ACCENT_POLLING = vars.color.accentPolling;

export function PollingTargets() {
  return (
    <figure className={s.figure}>
      <svg
        className={s.svg}
        viewBox="0 0 720 360"
        role="img"
        aria-label="SQPOLL과 IOPOLL이 폴링하는 대상의 차이"
      >
        <defs>
          <marker
            id="pt-arrow-blue"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT_INTERRUPT} />
          </marker>
          <marker
            id="pt-arrow-green"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT_POLLING} />
          </marker>
          <marker
            id="pt-arrow-muted"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={MUTED} />
          </marker>
        </defs>

        {/* Divider line */}
        <line x1="360" y1="20" x2="360" y2="340" stroke={BORDER} strokeWidth="1" strokeDasharray="4 4" />

        {/* === LEFT: SQPOLL === */}
        <text x="180" y="35" fontSize="15" fontWeight="700" fill={ACCENT_INTERRUPT} textAnchor="middle">
          SQPOLL
        </text>
        <text x="180" y="53" fontSize="11" fill={MUTED} textAnchor="middle" fontStyle="italic">
          제출 측 syscall 제거
        </text>

        {/* User box */}
        <rect x="40" y="80" width="280" height="50" rx="6" fill={SURFACE} stroke={BORDER} strokeWidth="1.5" />
        <text x="180" y="100" fontSize="12" fontWeight="600" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
          User task
        </text>
        <text x="180" y="118" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
          SQE 채우고 SQ tail 갱신만
        </text>

        {/* SQ ring (polling target) */}
        <rect x="40" y="170" width="280" height="60" rx="6" fill={SURFACE_ALT} stroke={ACCENT_INTERRUPT} strokeWidth="2" />
        <text x="180" y="190" fontSize="13" fontWeight="700" fill={ACCENT_INTERRUPT} textAnchor="middle" dominantBaseline="middle">
          SQ ring (공유 메모리)
        </text>
        <text x="180" y="210" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
          ← 폴링 대상
        </text>

        {/* User → SQ arrow */}
        <line x1="180" y1="130" x2="180" y2="168" stroke={MUTED} strokeWidth="1.5" markerEnd="url(#pt-arrow-muted)" />
        <text x="186" y="153" fontSize="10" fill={MUTED} fontStyle="italic">
          tail++
        </text>

        {/* Kernel kthread (the poller) */}
        <rect x="40" y="270" width="280" height="60" rx="6" fill={SURFACE} stroke={ACCENT_INTERRUPT} strokeWidth="1.5" />
        <text x="180" y="288" fontSize="12" fontWeight="600" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
          Kernel kthread (SQPOLL thread)
        </text>
        <text x="180" y="306" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
          while (true) check SQ tail
        </text>
        <text x="180" y="320" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
          (한 코어를 점유)
        </text>

        {/* kthread → SQ ring (polling arrow) */}
        <path
          d="M 180 270 Q 30 250, 30 220 Q 30 200, 40 200"
          fill="none"
          stroke={ACCENT_INTERRUPT}
          strokeWidth="2"
          markerEnd="url(#pt-arrow-blue)"
        />
        <text x="20" y="240" fontSize="10" fill={ACCENT_INTERRUPT} fontWeight="600" textAnchor="middle">
          폴링
        </text>

        {/* === RIGHT: IOPOLL === */}
        <text x="540" y="35" fontSize="15" fontWeight="700" fill={ACCENT_POLLING} textAnchor="middle">
          IOPOLL
        </text>
        <text x="540" y="53" fontSize="11" fill={MUTED} textAnchor="middle" fontStyle="italic">
          완료 측 인터럽트 제거
        </text>

        {/* User task box */}
        <rect x="400" y="80" width="280" height="50" rx="6" fill={SURFACE} stroke={ACCENT_POLLING} strokeWidth="1.5" />
        <text x="540" y="100" fontSize="12" fontWeight="600" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
          User task (블록 레이어 코드)
        </text>
        <text x="540" y="118" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
          blk_mq_poll() 안에서 spin
        </text>

        {/* Block layer middle (just decoration) */}
        <rect x="400" y="170" width="280" height="40" rx="6" fill={SURFACE_ALT} stroke={BORDER} strokeWidth="1" strokeDasharray="3 3" />
        <text x="540" y="190" fontSize="11" fill={MUTED} textAnchor="middle" dominantBaseline="middle">
          블록 레이어 / NVMe 드라이버
        </text>

        {/* Device CQ (polling target) */}
        <rect x="400" y="240" width="280" height="80" rx="6" fill={SURFACE_ALT} stroke={ACCENT_POLLING} strokeWidth="2" />
        <text x="540" y="262" fontSize="13" fontWeight="700" fill={ACCENT_POLLING} textAnchor="middle" dominantBaseline="middle">
          Device CQ (NVMe 하드웨어)
        </text>
        <text x="540" y="282" fontSize="11" fill={TEXT} textAnchor="middle" dominantBaseline="middle">
          ← 폴링 대상
        </text>
        <text x="540" y="302" fontSize="10" fill={MUTED} textAnchor="middle" dominantBaseline="middle" fontStyle="italic">
          (인터럽트는 발사되지 않음)
        </text>

        {/* User → Device arrow (polling) */}
        <path
          d="M 540 130 Q 700 180, 700 240 Q 700 270, 680 280"
          fill="none"
          stroke={ACCENT_POLLING}
          strokeWidth="2"
          markerEnd="url(#pt-arrow-green)"
        />
        <text x="710" y="200" fontSize="10" fill={ACCENT_POLLING} fontWeight="600" textAnchor="middle">
          폴링
        </text>
      </svg>
      <figcaption className={s.caption}>
        그림 4. SQPOLL과 IOPOLL이 폴링하는 대상의 차이. SQPOLL(왼쪽)에서는 커널 kthread가
        공유 메모리에 있는 SQ ring tail을 폴링한다 — 사용자/커널 통신 비용을 없앤다.
        IOPOLL(오른쪽)에서는 사용자 task가 블록 레이어 안에서 NVMe 디바이스의 하드웨어 CQ를
        폴링한다 — 인터럽트 비용을 없앤다. 같은 "polling"이라는 단어를 쓰지만 폴링 주체와
        폴링 대상이 모두 다르고, 서로 독립적인 기능이라 함께 켜는 것도 가능하다.
      </figcaption>
    </figure>
  );
}
