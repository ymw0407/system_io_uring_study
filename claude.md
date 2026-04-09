# io_uring Adaptive I/O Strategy — Study Site

이 저장소는 학부 시스템 연구 스터디 결과물을 정리하는 **단일 페이지 기술 사이트**다.
주제는 io_uring 환경에서 **interrupt vs polling vs adaptive** I/O 전략을 비교하는 것이며,
참고 톤은 https://dpas-lab.pages.dev/ 이다.

Claude는 이 문서를 **모든 세션의 시작점**으로 삼는다. 코드를 짜기 전, 글을 쓰기 전,
명령을 실행하기 전 반드시 이 문서의 규칙을 먼저 확인한다.

---

## 1. Project Identity

- **종류**: 정적 단일 페이지 (연구 노트 + 실험 리포트 하이브리드)
- **독자**: io_uring을 처음 듣는 CS 학부 3학년 ~ 시스템 분야 대학원생
- **목적**: 1/2/3회차 스터디를 narrative로 연결해 "읽으면 연구 흐름이 이해되는" 페이지를 만든다
- **비목적**: 블로그 플랫폼, CMS, 다중 페이지 사이트, SEO 최적화는 범위 밖

---

## 2. Tech Stack (고정)

이 스택은 **변경 금지**다. 다른 라이브러리로 대체하자는 제안을 하지 않는다.

- **Package manager**: `pnpm` — `npm`, `yarn`, `bun` 명령을 출력하지 않는다
- **Build**: Vite + React 18 + TypeScript (strict)
- **Styling**: **vanilla-extract** (`@vanilla-extract/css`, `@vanilla-extract/recipes`)
  - TailwindCSS, styled-components, emotion, CSS Modules **사용 금지**
  - 모든 스타일은 `*.css.ts` 파일에 작성
  - 색/폰트/여백은 반드시 `src/styles/theme.css.ts`의 토큰을 참조
- **Content**: MDX (`@mdx-js/rollup`)
- **Charts**: `recharts`
- **Code highlight**: `shiki` (다크 테마, `github-dark-dimmed`)
- **아이콘**: `lucide-react` (꼭 필요할 때만)

설치는 항상 다음 형태로 제안한다:
```bash
pnpm add <pkg>
pnpm add -D <pkg>
```

---

## 3. Folder Structure

```
src/
  styles/
    theme.css.ts        # createGlobalTheme — 모든 토큰의 단일 출처
    global.css.ts       # reset + body 스타일
  components/
    Section/
    CodeBlock/
    Chart/
    Callout/
    Hero/
    Toc/
  content/
    01-motivation.mdx
    02-background.mdx
    03-week1.mdx
    04-week2.mdx
    05-week3.mdx
    06-adaptive.mdx
    07-result.mdx
    08-conclusion.mdx
  pages/
    index.tsx
  data/
    experiments.ts      # recharts용 샘플/실측 데이터
```

새 컴포넌트는 항상 `ComponentName/ComponentName.tsx` + `ComponentName.css.ts` 쌍으로 만든다.

---

## 4. Design Tokens (단일 출처)

`src/styles/theme.css.ts`에서만 정의한다. 컴포넌트에서 hex나 px 리터럴을 직접 쓰지 않는다.

- `color.bg`: #0B0D10
- `color.surface`: #12151A
- `color.surfaceAlt`: #171B22
- `color.border`: #232A33
- `color.text`: #E6EAF0
- `color.textMuted`: #8A94A6
- `color.accentPolling`: #6EE7B7
- `color.accentInterrupt`: #93C5FD
- `color.accentAdaptive`: #FBBF24
- `font.sans`: Inter, Pretendard, system-ui
- `font.mono`: "JetBrains Mono", ui-monospace
- `space.1..12`: 4px 단위 스케일
- `radius.md`: 12px
- `maxWidth.prose`: 880px

색은 반드시 의미 기반으로 사용한다. polling 관련 그래프/뱃지는 `accentPolling`, interrupt는 `accentInterrupt`, adaptive는 `accentAdaptive`. 이 매핑은 페이지 전체에서 일관되어야 한다.

---

## 5. Writing Rules

이 프로젝트의 콘텐츠 품질 기준은 코드 품질만큼 중요하다.

- **줄글 중심**. 불릿은 설치 명령, 파라미터 목록, 체크리스트에만 허용한다
- **이모지 금지** (본문, 헤딩, 코드 주석 모두)
- **과장 금지**: "혁신적", "놀랍게도", "최고의" 같은 표현을 쓰지 않는다
- **용어 정확성**: SQE/CQE, SQPOLL, IOPOLL, kthread 같은 용어를 얼버무리지 않는다
- **이중 독자 기준**: 학부 3학년이 첫 문단부터 막히지 않으면서, 대학원생이 봐도 부정확하지 않아야 한다
- **수치는 그럴듯하게**: NVMe 4KB random read는 80~120μs, SATA SSD는 200~500μs 범위를 벗어나지 않는다. 모르면 만들지 말고 "측정 예정"이라고 쓴다
- **한국어 본문**, 코드 주석과 변수명은 영어

---

## 6. Code Rules

- **C 코드**는 실제로 컴파일 가능한 수준으로 작성한다. `liburing` API를 상상으로 만들지 않는다. 헷갈리면 `man io_uring_setup`, `man io_uring_enter` 또는 liburing 헤더를 확인한다
- 빌드 명령은 항상 함께 적는다: `gcc -O2 -o bench bench.c -luring`
- **TypeScript**는 strict 모드를 가정한다. `any` 사용 금지, 불가피하면 `unknown` + 타입 가드
- React 컴포넌트는 함수형 + named export, default export는 페이지 컴포넌트만
- `*.css.ts`에서는 `style`, `styleVariants`, `recipe`를 사용하고 인라인 객체를 컴포넌트에서 만들지 않는다

---

## 7. Section Order (페이지 narrative)

이 순서는 페이지의 논증 구조다. 함부로 바꾸지 않는다.

1. Hero
2. Problem Motivation — interrupt의 한계, NVMe 시대 latency 역전
3. Background — io_uring 아키텍처, SQ/CQ, Queue Depth
4. Step-by-Step Study — 1/2/3회차
5. Experiment — 그래프와 비교표
6. Adaptive Strategy — 정책과 pseudo code
7. Result & Insight
8. Conclusion

각 회차 섹션은 항상 **목표 → 개념 → 코드 → 실험 방법 → 결과** 다섯 블록을 가진다.

---

## 8. Workflow Expectations

Claude가 이 저장소에서 작업할 때 따르는 절차:

1. **읽기 먼저**: 변경할 파일과 인접 컴포넌트를 먼저 읽는다. 토큰이 이미 있는데 새로 만들지 않는다
2. **작은 단위 커밋 단위로 작업**: 한 번에 한 섹션, 한 컴포넌트
3. **스타일 작업 시**: 먼저 `theme.css.ts`를 확인하고, 부족한 토큰이 있으면 토큰을 먼저 추가한다
4. **MDX 작업 시**: 본문을 먼저 쓰고, 그 본문에 맞는 컴포넌트가 없을 때만 새 컴포넌트를 만든다
5. **불확실하면 멈춘다**: liburing API 시그니처가 헷갈리거나 커널 동작이 불확실하면, 추측하지 말고 사용자에게 확인을 요청한다

---

## 9. Strategy Pivot Guardrails

다음 상황에서는 작업을 중단하고 사용자에게 보고한다:

- TailwindCSS나 다른 스타일링 라이브러리가 더 낫다고 판단되는 경우 → 보고만 하고 도입하지 않는다
- 섹션 순서를 바꿔야 한다고 판단되는 경우 → 제안만 하고 임의로 바꾸지 않는다
- 외부 데이터셋이나 벤치마크 결과가 필요한 경우 → 만들어내지 말고 요청한다

---

## 10. Skills

이 프로젝트에는 `.claude/skills/` 아래에 다음 스킬이 있다. 작업 종류에 맞으면 해당 스킬의 `SKILL.md`를 먼저 읽는다.

- `vanilla-extract-styling` — 스타일 작업 전 필독
- `mdx-authoring` — MDX 콘텐츠 작성 전 필독
- `io-uring-content` — io_uring 관련 본문/코드 작성 전 필독
- `recharts-experiment` — 실험 그래프 만들 때 필독
