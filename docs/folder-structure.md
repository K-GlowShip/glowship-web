# 폴더 구조

[FSD(Feature-Sliced Design)](https://fsd.how/kr/docs/get-started/overview/) 기준입니다. README의 요약 규칙을 자세히 설명하는 문서입니다.

## 1. 구조

`processes`(공식 폐기)와 `widgets`는 사용하지 않습니다. `features`, `entities`는 처음에는 만들지 않고 필요할 때 생성합니다.

```
src/
├── app/
│   ├── entrypoint/       # main.tsx, providers.tsx
│   ├── routes/           # router.tsx, RequireAuth.tsx
│   ├── layouts/          # AppLayout.tsx (헤더 + 사이드바)
│   └── styles/
├── pages/
│   ├── login/            # SCR-001
│   ├── dashboard/        # SCR-002
│   ├── delay-center/     # SCR-003
│   ├── decision-history/ # SCR-004
│   └── sync-data/        # SCR-005
└── shared/
    ├── api/              # fetcher.ts, error.ts, endpoints/, index.ts
    ├── ui/               # button/, badge/, table/ ...
    ├── lib/              # format-date/ ...
    ├── config/           # env.ts
    └── assets/
```

| layer | 역할 | 하위 구조 |
| --- | --- | --- |
| `app` | 진입점, 라우팅, Provider, 공통 레이아웃, 전역 스타일 | segment |
| `pages` | 화면 단위. 한 화면에서만 쓰는 코드 | slice(화면) → segment |
| `features` | 여러 화면에서 쓰는, 데이터를 변경하는 행동 | slice(행동) → segment |
| `entities` | 여러 화면에서 쓰는 도메인 데이터 표시 UI·타입 | slice(도메인) → segment |
| `shared` | 도메인과 관계없는 공통 코드, API 요청 | segment |

## 2. segment

slice 안은 목적별 segment로 나눕니다. 필요한 것만 만듭니다.

| segment | 용도 |
| --- | --- |
| `ui` | 컴포넌트, 스타일 |
| `model` | 타입, 상수·라벨, zod 스키마, zustand 스토어, 로직 훅, 계산 함수 |
| `api` | 이 slice에서만 쓰는 서버 요청. (`pages`, `features`만 만들고 `entities`에는 만들지 않음) |
| `lib` | 도메인 의미가 없는 헬퍼 |
| `config` | 설정값 |

```
pages/delay-center/
├── ui/DelayCenterPage.tsx
├── model/useDelayFilter.ts
└── index.ts
    # export { DelayCenterPage } from './ui/DelayCenterPage'
```

- segment 이름은 파일 종류(`types`, `components`, `hooks`)가 아니라 목적으로 짓습니다. 파일 이름은 자유입니다.
- 지연·재고·대응안 같은 도메인 의미가 있으면 `model`, 없으면 `lib`입니다.

## 3. import 규칙

`@/`는 `src/`를 가리키는 경로 별칭입니다. `vite.config.ts`와 `tsconfig.json`에 함께 설정합니다.

| 경우 | 가능 | 예 |
| --- | --- | --- |
| 위 → 아래 (건너뛰기 포함) | O | `pages` → `entities` |
| 아래 → 위 | X | `entities` → `features` |
| 같은 layer의 다른 slice | X | `pages/dashboard` → `pages/delay-center` |
| 같은 slice 안 segment끼리, `shared` 안 segment끼리 | O | `shared/ui` → `shared/lib` |

**slice**는 `index.ts`(Public API)로만 import합니다. 안에서 파일을 옮겨도 `index.ts`만 고치면 됩니다.

- `index.ts`에는 바깥에서 써야 하는 것만 export합니다. 타입은 `export type`으로 내보냅니다.
- 같은 slice 안에서는 자기 `index.ts`를 거치지 않고 상대 경로로 import합니다. (`../model/status`) 자기 `index.ts`를 거치면 순환 참조가 생길 수 있습니다.
- VS Code 자동 import가 `@/entities/delay-event/ui/...`처럼 깊은 경로로 잡히면 slice 경로로 고칩니다.

**`shared/ui`, `shared/lib`**은 큰 index 하나로 묶지 않고 컴포넌트·함수별 폴더에 `index.ts`를 둡니다. 큰 index는 쓰지 않는 컴포넌트의 의존성까지 불러와 번들과 개발 서버를 무겁게 합니다. ([Public API](https://fsd.how/kr/docs/reference/public-api/))

```ts
import { DelayStatusBadge } from '@/entities/delay-event'
import { Button } from '@/shared/ui/button'
```

- 구조가 다르면 폴더를 나눕니다. (`shared/ui/icon-button/`)
- 컴포넌트 폴더는 `shared/ui` 바로 아래에 나열합니다. 많아지면 카테고리로 묶되 카테고리 폴더에는 `index.ts`를 두지 않습니다.
- `shared/api`는 관련된 요청 모음이므로 `index.ts` 하나로 export합니다.

## 4. 코드를 어디에 만들까

1. 도메인과 관계없는 코드(Button, 날짜 포맷)와 API 요청 함수는 처음부터 `shared`에 만듭니다.
2. 그 외 코드는 사용하는 화면의 `pages/화면이름/`에 먼저 만듭니다.
3. 다른 화면에서 import해야 하는 순간, 복사하지 말고 옮깁니다. 같은 layer끼리는 import할 수 없으므로 막히는 시점이 옮길 시점입니다.

| 상황 | 처리 |
| --- | --- |
| 대시보드의 `DelayStatusBadge`를 지연 대응 센터에서도 씀 | `entities/delay-event/ui/`로 이동 |
| 지연 대응 센터의 재분석 버튼을 이력 화면에서도 씀 | `features/rerun-analysis/ui/`로 이동 |
| 대시보드에서만 쓰는 KPI 계산 | `pages/dashboard/`에 둠 |
| 모양만 비슷하고 의미가 다른 카드 | 합치지 않고 `shared/ui`의 Card를 함께 사용 |

옮기는 작업은 다른 화면에서 쓰려는 사람이 하고, 기능 변경과 커밋을 분리합니다. (`refactor: DelayStatusBadge를 entities로 이동`)

### entities와 features 구분

둘 다 `ui`를 가질 수 있습니다. 기준은 "누르거나 입력하면 서버 데이터가 바뀌는가"입니다.

| | `entities` | `features` |
| --- | --- | --- |
| 하는 일 | 보여주기만 함 | 데이터를 변경함 |
| 예 | `DelayStatusBadge`, `ResponseOptionTable` | `DecideResponseForm`, `RerunAnalysisButton` |

### React Query 훅

query 키와 query 옵션은 `shared/api`에 두고, 훅은 쓰는 화면의 `model`에 먼저 만듭니다.

| 다른 화면에서 필요한 것 | 처리 |
| --- | --- |
| 같은 데이터 조회만 | 옮기지 않음. 각 화면에서 `shared/api`의 query 옵션으로 조회 |
| 조회 + 가공 로직 (정렬, 계산, 표시용 변환) | `entities/도메인/model/`로 이동 |
| 변경(`useMutation`) + 성공 후 처리 | `features/행동/model/`로 이동 |

## 5. 같은 layer의 코드가 필요할 때

| 방법 | 언제 |
| --- | --- |
| 위 layer에서 조합 | 여러 entity를 한 화면에 보여줄 때 `pages`에서 모두 import해 배치 |
| props로 전달 | feature가 다른 feature의 값(예: 팀장 여부)이 필요할 때 `pages`에서 꺼내 넘김 |
| slot | entity 카드 안에 feature 버튼을 넣을 때 카드는 자리만 만들고 `pages`에서 넣음 |
| 더 아래로 내리기 | 로그인 사용자처럼 어디서나 필요한 값은 `entities/user` 등에 둠 |
| `@x` | entity끼리 타입만 필요할 때. 최소한으로 사용 ([cross-import](https://fsd.how/kr/docs/reference/slices-segments/)) |

slot 예:

```tsx
export function DelayInfoCard({ actions }: { actions?: ReactNode }) {
  return (
    <div>
      <h3>지연 정보</h3>
      {actions}
    </div>
  )
}
```

```tsx
<DelayInfoCard actions={<RerunAnalysisButton delayEventId={id} />} />
```

## 6. API와 환경변수

| 무엇 | 위치 |
| --- | --- |
| `fetcher`(axios 인스턴스, 인터셉터), `API`(요청 메서드 객체) | `shared/api/fetcher.ts` |
| `ApiError`(에러 응답 변환) | `shared/api/error.ts` |
| 요청 함수, 응답 타입, query 옵션 | `shared/api/endpoints/` |
| 한 slice에서만 쓰는 요청 | 그 slice의 `api` |
| 환경변수를 읽고 검증하는 코드 | `shared/config/env.ts` |

- `entities`에는 요청 함수와 백엔드 응답 타입을 두지 않습니다. ([API 요청](https://fsd.how/kr/docs/guides/examples/api-requests/))
- 요청 파일은 백엔드 리소스(URL 첫 경로)별로 하나씩 만듭니다. (`endpoints/delay-events.ts`, `endpoints/analyses.ts`)
- 실제 백엔드 API 명세에 있는 요청만 만듭니다.

## 7. app

| 무엇 | 위치 |
| --- | --- |
| 앱 진입점, Provider | `app/entrypoint/` |
| 라우트 정의, 로그인 확인 | `app/routes/` |
| 로그인 후 공통 헤더 + 사이드바 | `app/layouts/` |
| 전역 스타일 | `app/styles/` |

- 특정 화면 전용 레이아웃은 그 `pages` slice, 비즈니스 맥락 없는 틀은 `shared/ui`에 둡니다. ([페이지 레이아웃](https://fsd.how/kr/docs/guides/examples/page-layout/))
- 헤더의 알림·로그아웃은 `features`로 만들어 `app/layouts`에서 가져다 씁니다.
- 진입점을 옮겼으므로 `index.html`의 스크립트 경로를 `/src/app/entrypoint/main.tsx`로 맞춥니다.