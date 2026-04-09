---
name: recharts-experiment
description: 실험 결과를 시각화하는 `<Chart>` 컴포넌트와 `src/data/experiments.ts`의 데이터셋을 작성/수정할 때 사용한다. Queue Depth vs latency, CPU load vs throughput, 세 방식 비교 같은 그래프를 그릴 때 필요하다.
---

# Recharts Experiment Charts

## 데이터 위치

모든 실험 데이터는 `src/data/experiments.ts`에 모은다. MDX나 컴포넌트 안에 raw 배열을 박지 않는다.

```ts
// src/data/experiments.ts
export type IoMode = 'interrupt' | 'polling' | 'adaptive';

export interface QdLatencyPoint {
  qd: number;
  interrupt: number; // μs
  polling: number;
  adaptive: number;
}

export const qdLatency: QdLatencyPoint[] = [
  { qd: 1,   interrupt: 95,  polling: 78,  adaptive: 80 },
  { qd: 4,   interrupt: 102, polling: 72,  adaptive: 74 },
  { qd: 16,  interrupt: 118, polling: 70,  adaptive: 71 },
  { qd: 64,  interrupt: 145, polling: 74,  adaptive: 75 },
  { qd: 256, interrupt: 210, polling: 92,  adaptive: 95 },
];
```

데이터에 단위(μs, MB/s, %)는 타입이나 주석으로 명시한다.

## Chart 컴포넌트 인터페이스

`<Chart>`는 단순한 wrapper다. recharts를 직접 import하지 말고 항상 이 컴포넌트를 거친다.

```tsx
<Chart
  kind="line"
  data={qdLatency}
  xKey="qd"
  series={[
    { key: 'interrupt', label: 'Interrupt', color: 'interrupt' },
    { key: 'polling',   label: 'Polling',   color: 'polling' },
    { key: 'adaptive',  label: 'Adaptive',  color: 'adaptive' },
  ]}
  xLabel="Queue Depth"
  yLabel="Latency (μs)"
/>
```

`color`는 hex가 아니라 의미 키워드다. 컴포넌트 내부에서 `vars.color.accentInterrupt` 등으로 매핑한다. 이 매핑은 페이지 전체 polling/interrupt/adaptive 색 약속과 일치해야 한다.

## 그래프 종류 가이드

- **QD vs latency** — line chart, x축 log scale 권장
- **CPU load vs throughput** — line chart 또는 bar chart
- **세 방식 비교 (단일 시점)** — bar chart
- pie chart는 사용하지 않는다

## 축과 가독성

- 그리드 색은 `vars.color.border`
- 축 label과 tick은 `vars.color.textMuted`
- legend는 차트 상단, 가로 배치
- tooltip은 다크 배경 (`vars.color.surfaceAlt`) + 1px border
- 데이터 포인트가 5개 미만이면 line 대신 bar를 고려한다

## 데이터 정직성

- 측정한 값과 만든 값(샘플)을 구분한다. 만든 값이면 차트 캡션에 "예시 데이터" 명시
- y축을 0부터 시작하지 않을 때는 캡션에 명시
- 라인 차트에서 점을 잇는 보간이 실제 측정 사이의 동작을 의미하지 않는다는 것을 본문에서 한 번 짚는다

## 작업 전 체크리스트

- [ ] 데이터가 `experiments.ts`에 있는가
- [ ] 단위가 명시되어 있는가
- [ ] color가 polling/interrupt/adaptive 의미 키워드로 지정되었는가
- [ ] 예시 데이터라면 캡션에 표기했는가
- [ ] x/y축 label이 단위와 함께 있는가
