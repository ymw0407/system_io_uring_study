import { vars } from '../../styles/theme.css';
import * as s from './RingBufferDiagram.css';

const TEXT = vars.color.text;
const MUTED = vars.color.textMuted;
const BORDER = vars.color.border;
const SURFACE = vars.color.surface;
const SURFACE_ALT = vars.color.surfaceAlt;
const ACCENT_SUBMIT = vars.color.accentInterrupt;     // 파랑: 제출 흐름
const ACCENT_COMPLETE = vars.color.accentAdaptive;    // 노랑: 완료 흐름
const SHARED_BG = vars.color.surfaceAlt;

export function RingBufferDiagram() {
  return (
    <figure className={s.figure}>
      <svg
        className={s.svg}
        viewBox="0 0 720 420"
        role="img"
        aria-label="io_uring 공유 링 버퍼 구조 — User space와 Kernel이 SQ ring, SQE array, CQ ring을 mmap으로 공유"
      >
        <defs>
          <marker
            id="rb-arrow-submit"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT_SUBMIT} />
          </marker>
          <marker
            id="rb-arrow-complete"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT_COMPLETE} />
          </marker>
        </defs>

        {/* User space lane */}
        <rect x="40" y="20" width="640" height="60" rx="8" fill={SURFACE} stroke={BORDER} strokeWidth="1.5" />
        <text x="60" y="55" fontSize="14" fontWeight="600" fill={TEXT} dominantBaseline="middle">
          User space
        </text>
        <text x="60" y="73" fontSize="11" fill={MUTED} dominantBaseline="middle">
          애플리케이션 프로세스 (libc, liburing)
        </text>

        {/* Shared region note (moved to top header to avoid overlapping arrows) */}
        <text x="360" y="12" fontSize="11" fontStyle="italic" fill={MUTED} textAnchor="middle">
          세 영역은 mmap(MAP_SHARED)로 User space와 Kernel이 같은 물리 페이지를 공유한다
        </text>

        {/* SQ ring */}
        <g>
          <rect x="40" y="135" width="200" height="120" rx="8" fill={SHARED_BG} stroke={ACCENT_SUBMIT} strokeWidth="1.5" />
          <text x="140" y="155" fontSize="13" fontWeight="600" fill={TEXT} textAnchor="middle">
            SQ ring
          </text>
          <text x="140" y="172" fontSize="11" fill={MUTED} textAnchor="middle">
            Submission Queue
          </text>
          {/* mini ring viz */}
          <g transform="translate(140, 215)">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
              const cx = Math.cos(angle) * 22;
              const cy = Math.sin(angle) * 22;
              return (
                <rect
                  key={i}
                  x={cx - 6}
                  y={cy - 5}
                  width="12"
                  height="10"
                  rx="2"
                  fill={i < 3 ? ACCENT_SUBMIT : SURFACE}
                  stroke={ACCENT_SUBMIT}
                  strokeWidth="1"
                  opacity={i < 3 ? 0.7 : 1}
                />
              );
            })}
          </g>
        </g>

        {/* SQE array */}
        <g>
          <rect x="260" y="135" width="200" height="120" rx="8" fill={SHARED_BG} stroke={MUTED} strokeWidth="1.5" />
          <text x="360" y="155" fontSize="13" fontWeight="600" fill={TEXT} textAnchor="middle">
            SQE array
          </text>
          <text x="360" y="172" fontSize="11" fill={MUTED} textAnchor="middle">
            요청 본문 (각 64 bytes)
          </text>
          {/* mini array viz */}
          <g transform="translate(280, 195)">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect
                key={i}
                x={i * 22}
                y="0"
                width="18"
                height="40"
                rx="2"
                fill={i < 3 ? SURFACE : SURFACE_ALT}
                stroke={i < 3 ? ACCENT_SUBMIT : BORDER}
                strokeWidth="1"
                opacity={i < 3 ? 1 : 0.6}
              />
            ))}
          </g>
        </g>

        {/* CQ ring */}
        <g>
          <rect x="480" y="135" width="200" height="120" rx="8" fill={SHARED_BG} stroke={ACCENT_COMPLETE} strokeWidth="1.5" />
          <text x="580" y="155" fontSize="13" fontWeight="600" fill={TEXT} textAnchor="middle">
            CQ ring
          </text>
          <text x="580" y="172" fontSize="11" fill={MUTED} textAnchor="middle">
            Completion Queue
          </text>
          {/* mini ring viz */}
          <g transform="translate(580, 215)">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
              const cx = Math.cos(angle) * 22;
              const cy = Math.sin(angle) * 22;
              return (
                <rect
                  key={i}
                  x={cx - 6}
                  y={cy - 5}
                  width="12"
                  height="10"
                  rx="2"
                  fill={i < 2 ? ACCENT_COMPLETE : SURFACE}
                  stroke={ACCENT_COMPLETE}
                  strokeWidth="1"
                  opacity={i < 2 ? 0.7 : 1}
                />
              );
            })}
          </g>
        </g>

        {/* Kernel lane */}
        <rect x="40" y="335" width="640" height="60" rx="8" fill={SURFACE} stroke={BORDER} strokeWidth="1.5" />
        <text x="60" y="370" fontSize="14" fontWeight="600" fill={TEXT} dominantBaseline="middle">
          Kernel
        </text>
        <text x="60" y="388" fontSize="11" fill={MUTED} dominantBaseline="middle">
          io_uring 서브시스템 + 블록 레이어
        </text>

        {/* === Submission flow: 데이터는 User → SQE/SQ → Kernel으로 모두 아래로 흐름 === */}
        {/* ① User → SQE */}
        <line x1="360" y1="80" x2="360" y2="130" stroke={ACCENT_SUBMIT} strokeWidth="2" markerEnd="url(#rb-arrow-submit)" />
        <text x="368" y="105" fontSize="11" fill={ACCENT_SUBMIT} fontWeight="600" dominantBaseline="middle">
          ① SQE 작성
        </text>

        {/* ② User → SQ ring (tail 갱신) */}
        <line x1="140" y1="80" x2="140" y2="130" stroke={ACCENT_SUBMIT} strokeWidth="2" markerEnd="url(#rb-arrow-submit)" />
        <text x="148" y="105" fontSize="11" fill={ACCENT_SUBMIT} fontWeight="600" dominantBaseline="middle">
          ② tail 갱신
        </text>

        {/* ③ SQ ring → Kernel (tail 확인) */}
        <line x1="140" y1="260" x2="140" y2="330" stroke={ACCENT_SUBMIT} strokeWidth="2" markerEnd="url(#rb-arrow-submit)" />
        <text x="148" y="295" fontSize="11" fill={ACCENT_SUBMIT} fontWeight="600" dominantBaseline="middle">
          ③ tail 확인
        </text>

        {/* ④ SQE → Kernel (SQE 처리) */}
        <line x1="360" y1="260" x2="360" y2="330" stroke={ACCENT_SUBMIT} strokeWidth="2" markerEnd="url(#rb-arrow-submit)" />
        <text x="368" y="295" fontSize="11" fill={ACCENT_SUBMIT} fontWeight="600" dominantBaseline="middle">
          ④ SQE 처리
        </text>

        {/* === Completion flow: 데이터는 Kernel → CQ → User로 모두 위로 흐름 === */}
        {/* ⑤ Kernel → CQ ring */}
        <line x1="580" y1="330" x2="580" y2="260" stroke={ACCENT_COMPLETE} strokeWidth="2" markerEnd="url(#rb-arrow-complete)" />
        <text x="588" y="295" fontSize="11" fill={ACCENT_COMPLETE} fontWeight="600" dominantBaseline="middle">
          ⑤ CQE 작성
        </text>

        {/* ⑥ CQ ring → User */}
        <line x1="580" y1="130" x2="580" y2="80" stroke={ACCENT_COMPLETE} strokeWidth="2" markerEnd="url(#rb-arrow-complete)" />
        <text x="588" y="105" fontSize="11" fill={ACCENT_COMPLETE} fontWeight="600" dominantBaseline="middle">
          ⑥ CQE 수확
        </text>
      </svg>
      <figcaption className={s.caption}>
        그림 3. io_uring의 공유 링 버퍼 구조. SQ ring, SQE array, CQ ring 세 영역이 mmap으로
        User space와 Kernel에 동시에 매핑된다. 파란 화살표는 제출 흐름(① SQE 작성 → ② tail 갱신
        → ③ 커널이 tail 확인 → ④ SQE 처리), 노란 화살표는 완료 흐름(⑤ 커널이 CQE 작성 →
        ⑥ 사용자가 CQE 수확)이다. 모든 단계가 같은 물리 메모리를 가리키므로 어느 지점에서도
        메모리 복사가 일어나지 않는다.
      </figcaption>
    </figure>
  );
}
