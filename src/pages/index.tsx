import { Hero } from '../components/Hero/Hero';
import { StepSection } from '../components/StepSection/StepSection';
import { StepCard } from '../components/StepCard/StepCard';

export default function Landing() {
  return (
    <>
      <Hero />

      <StepSection title="Study Steps" id="steps">
        <StepCard
          step={1}
          kind="setup"
          label="ROUND 1 — C로 직접 구현"
          title="io_uring으로 파일 읽기"
          description="liburing으로 io_uring_queue_init → get_sqe → prep_read → submit → wait_cqe 흐름을 손으로 짜 본다. 정밀한 측정보다 SQ/CQ가 무엇인지 몸으로 이해하는 것이 목표다."
          tools={['liburing', 'C', 'clock_gettime']}
          href="/round1"
        />

        <StepCard
          step={2}
          kind="lab"
          label="ROUND 2 — fio로 정밀 측정"
          title="실험 매트릭스 돌리기"
          description="모드(interrupt / SQPOLL / IOPOLL) x QD(1~256) x CPU 부하(idle/50%/100%) 매트릭스를 fio 셸 스크립트 한 장으로 돌린다. C로 짜면 수백 줄이지만 fio는 JSON까지 뽑아 준다."
          tools={['fio', 'io_uring engine', 'stress-ng', 'jq']}
          href="/round2"
        />

        <StepCard
          step={3}
          kind="default"
          label="ROUND 3 — C로 adaptive 구현"
          title="동적 전환 정책 만들기"
          description="fio에는 adaptive 모드가 없다. CPU usage와 QD를 보고 polling/interrupt를 동적 전환하는 로직을 직접 C로 짠다. 이것이 이 과제의 유일한 새로운 기여다."
          tools={['liburing', '/proc/stat', 'adaptive C', 'vs fio']}
          href="/round3"
          isLast
        />
      </StepSection>
    </>
  );
}
