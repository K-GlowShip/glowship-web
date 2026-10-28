# pxr 단위 사용 규칙

픽셀 기반 크기를 지정할 때는 `px` 대신 `pxr` 단위를 사용합니다.
`pxr`은 "pixel to rem"의 약자로, `{숫자}pxr`을 `{숫자 / 16}rem`으로 바꿔 주는 Tailwind 클래스입니다. (예: `16pxr` → `1rem`)

## 동작 원리

이 프로젝트는 Tailwind CSS v4를 사용하므로 `tailwind.config.ts` 없이 CSS에서 설정합니다.

- [scripts/generate-pxr.ts](../scripts/generate-pxr.ts)가 1~1440 범위의 `--spacing-{숫자}pxr` 변수를 만들어 [src/app/styles/pxr.css](../src/app/styles/pxr.css)에 씁니다.
- [src/app/styles/index.css](../src/app/styles/index.css)에서 `pxr.css`를 import합니다.
- `pxr.css`는 생성 파일이라 직접 수정하지 않습니다. 범위를 바꿀 때는 스크립트를 고치고 `pnpm generate:pxr`를 실행합니다.
- 코드에서 쓰는 값만 빌드 CSS에 포함되므로 변수가 많아도 번들 크기는 늘지 않습니다.

| pxr 클래스 | 실제 CSS 값 |
| --- | --- |
| `8pxr` | `0.5rem` |
| `16pxr` | `1rem` |
| `24pxr` | `1.5rem` |
| `400pxr` | `25rem` |

## 사용 규칙

### 1. Tailwind 클래스는 `pxr`을 사용합니다

```tsx
// 올바른 사용
<div className="h-56pxr w-400pxr gap-8pxr p-16pxr mt-24pxr" />

// 잘못된 사용: px 직접 사용 금지
<div className="h-[56px] w-[400px] p-[16px]" />
```

Tailwind 기본 숫자 클래스(`p-4`, `w-50` 등)는 4px 단위라 값이 헷갈립니다. 크기를 쓸 때는 `pxr`로 통일합니다.

### 2. 인라인 스타일이 불가피하면 `rem`으로 씁니다

인라인 `style`은 최소화하고 가능하면 Tailwind 클래스를 우선 사용합니다. 불가피할 때는 px을 16으로 나눈 `rem` 값을 씁니다.

```tsx
// 올바른 사용 (400px = 25rem)
<div style={{ width: '25rem' }} />

// 잘못된 사용
<div style={{ width: '400px' }} />
```

### 3. 런타임에 정해지는 값도 `rem`으로 바꿉니다

```tsx
<div style={{ width: `${width / 16}rem` }} />
```

### 4. 예외는 arbitrary value에 `rem`으로 씁니다

`pxr`은 1~1440 범위만 지원합니다. 범위를 벗어나거나, `pxr`이 적용되지 않는 경우에는 `px` 대신 arbitrary value에 `rem`을 씁니다. (px ÷ 16)

```tsx
<div className="w-[100rem]" /> // 1600px
```

`pxr`이 적용되지 않는 경우를 발견하면 원인을 확인하고 이 문서에 사례를 추가합니다.

## 적용되는 속성

| Tailwind 접두사 | CSS 속성 |
| --- | --- |
| `w-`, `min-w-`, `max-w-` | width |
| `h-`, `min-h-`, `max-h-` | height |
| `size-` | width, height |
| `p-`, `px-`, `py-`, `pt-`, `pr-`, `pb-`, `pl-` | padding |
| `m-`, `mx-`, `my-`, `mt-`, `mr-`, `mb-`, `ml-` | margin (음수는 `-mt-8pxr`) |
| `gap-`, `gap-x-`, `gap-y-` | gap |
| `top-`, `right-`, `bottom-`, `left-`, `inset-` | position offset |
| `space-x-`, `space-y-` | child spacing |

## 글자 크기

글자 크기는 `pxr`이 아니라 Figma 글자 스타일 토큰을 사용합니다. ([src/app/styles/index.css](../src/app/styles/index.css)의 `@theme`)

| 클래스 | 크기/줄 간격 |
| --- | --- |
| `text-display` | 32/44 |
| `text-h1` | 28/40 |
| `text-h2` | 22/32 |
| `text-h3` | 18/28 |
| `text-b1` | 14/22 |
| `text-b2` | 13/22 |
| `text-caption` | 12/18 |
