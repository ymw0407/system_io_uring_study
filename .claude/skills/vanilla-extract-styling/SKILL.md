---
name: vanilla-extract-styling
description: 이 프로젝트에서 스타일을 작성, 수정, 리팩터링할 때 사용한다. `*.css.ts` 파일을 만들거나, 새 컴포넌트의 시각적 디자인을 결정하거나, 디자인 토큰을 추가/변경할 때 반드시 먼저 읽는다. TailwindCSS나 다른 CSS-in-JS로 전환하자는 판단이 들 때도 이 스킬이 그 결정을 차단한다.
---

# Vanilla-extract Styling

## 핵심 원칙

이 프로젝트의 모든 스타일은 vanilla-extract로 작성한다. 예외 없다. Tailwind class, styled-components, emotion, 인라인 `style={{}}` 객체는 사용하지 않는다. (단, 동적 CSS 변수 주입을 위한 `style={{ ['--x' as string]: value }}`는 허용)

## 파일 규칙

컴포넌트는 항상 두 파일 쌍으로 만든다:

```
Section/
  Section.tsx
  Section.css.ts
```

`*.css.ts`는 빌드 타임에 실행되므로 런타임 값(props, state)을 직접 참조할 수 없다. 동적 값이 필요하면 `recipe`의 variants 또는 CSS 변수로 처리한다.

## 토큰 사용

색, 여백, 폰트는 반드시 `src/styles/theme.css.ts`의 `vars`를 import해서 사용한다. hex 리터럴이나 px 리터럴을 컴포넌트 스타일에 직접 적지 않는다.

```ts
// 금지
import { style } from '@vanilla-extract/css';
export const card = style({
  background: '#12151A',
  padding: '24px',
});

// 권장
import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';
export const card = style({
  background: vars.color.surface,
  padding: vars.space[6],
});
```

토큰에 없는 값이 필요하면, **컴포넌트에 hex를 박지 말고 토큰을 먼저 추가**한다. 토큰 추가는 `theme.css.ts` 한 곳에서만 한다.

## Variants

조건부 스타일은 `recipe`로 표현한다.

```ts
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../styles/theme.css';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    padding: `${vars.space[1]} ${vars.space[3]}`,
    borderRadius: vars.radius.sm,
    fontFamily: vars.font.mono,
  },
  variants: {
    kind: {
      polling:   { background: vars.color.accentPolling,   color: vars.color.bg },
      interrupt: { background: vars.color.accentInterrupt, color: vars.color.bg },
      adaptive:  { background: vars.color.accentAdaptive,  color: vars.color.bg },
    },
  },
  defaultVariants: { kind: 'interrupt' },
});
```

`kind`는 페이지 전체에서 polling/interrupt/adaptive 매핑을 일관되게 유지하는 핵심이다. 이 매핑은 그래프의 라인 색에서도 동일하게 사용된다.

## 글로벌 스타일

`globalStyle`은 reset과 `body`, `html` 수준에만 사용한다. 컴포넌트별 글로벌 셀렉터는 피한다. 코드 블록의 syntax highlight 색상 오버라이드는 예외적으로 `globalStyle('pre code .token-...', {...})`로 작성할 수 있다.

## 자주 하는 실수

- `*.css.ts` 안에서 React import — 금지
- hex 리터럴 직접 사용 — 토큰으로 옮길 것
- 같은 스타일을 두 컴포넌트에서 복사 — 공통 컴포넌트로 추출하거나 토큰화할 것
- `style([a, b])`로 합성할 수 있는데 새 style을 또 만드는 것 — 합성 우선

## 작업 전 체크리스트

- [ ] 추가하려는 색/여백이 이미 토큰에 있는가
- [ ] 컴포넌트가 `.tsx` + `.css.ts` 쌍으로 분리되어 있는가
- [ ] hex나 px 리터럴이 컴포넌트에 박혀있지 않은가
- [ ] 조건부 스타일을 boolean prop + 분기 대신 `recipe` variants로 표현했는가
