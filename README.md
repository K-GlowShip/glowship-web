# GlowShip Web

GlowShip 웹 클라이언트 저장소입니다.

> 프로젝트 한 줄 소개를 여기에 작성합니다.

## 관련 저장소

| 저장소 | 설명 |
| --- | --- |
| [glowship-web](https://github.com/K-GlowShip/glowship-web) | 웹 클라이언트 (React + Vite) — 현재 저장소 |
| [glowship-server](https://github.com/K-GlowShip/glowship-server) | 백엔드 서버 (FastAPI: API + AI 에이전트) |

## 기술 스택

- **React**: UI 라이브러리
- **Vite**: 빌드 도구 및 개발 서버
- **ESLint / Prettier**: 코드 스타일 (GitHub Actions에서 검사)

> 상태 관리, 라우팅, 스타일링, HTTP 클라이언트 등 세부 라이브러리는 개발환경 설정 시 결정합니다.

## 폴더 구조

[FSD(Feature-Sliced Design)](https://fsd.how/kr/docs/get-started/overview/) 기반으로 구성합니다.

```
src/
├── app/            # 진입점, 라우팅, 공통 레이아웃, 전역 스타일
├── pages/          # 화면 단위 (login, dashboard, delay-center 등)
└── shared/
    ├── api/        # axios 인스턴스, 백엔드 리소스별 요청 함수
    ├── ui/         # Button, Badge, Table 등 공통 UI
    ├── lib/        # 날짜 포맷 등 유틸
    └── config/     # 환경변수
```

> slice: `pages`, `features`, `entities` 아래의 화면·기능·도메인별 폴더 (예: `pages/dashboard`, `entities/delay-event`)

### import 규칙

- 위 layer는 아래 layer만 import합니다. (`app` → `pages` → `features` → `entities` → `shared`)
- 같은 layer의 다른 slice는 import하지 않습니다. (`pages/dashboard`에서 `pages/delay-center` X)
- slice는 `index.ts`를 통해서만 import합니다. (`@/entities/delay-event` O, `@/entities/delay-event/ui/DelayStatusBadge` X)

### 코드 위치

- 화면 코드는 해당 `pages/화면이름/`에 먼저 만듭니다.
- 다른 화면에서도 같은 코드가 필요해지면 아래 폴더를 만들어 옮깁니다.
  - `entities`: 도메인 데이터 표시
  - `features`: 저장·선택·실행 같은 데이터 변경 행동

코드를 어디에 만들지 헷갈리면 [폴더 구조 문서](docs/folder-structure.md)를 참고하세요.
 
## 개발환경

개발환경 설정은 추후 진행 예정입니다. 설정이 완료되면 아래 내용을 채웁니다.

- Node.js 버전
- 설치 및 실행 방법 (`npm install`, `npm run dev`)
- 환경 변수 (`.env.example`)
- 백엔드 API 연동 주소

## 코드 스타일

`main`, `develop` 브랜치로의 push 및 Pull Request 시 GitHub Actions에서 ESLint와 Prettier로 검사합니다.
`package.json`이 추가되기 전까지는 검사를 건너뜁니다.

## 브랜치 전략

> 팀 합의 후 작성합니다. (예: `main` / `develop` / `feature/*`)

## 커밋 컨벤션

> 팀 합의 후 작성합니다. (예: `feat:`, `fix:`, `docs:`, `chore:`)
