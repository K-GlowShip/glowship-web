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
- **TypeScript**, **Tailwind CSS**
- **React Router**, **axios**, **TanStack Query**
- **ESLint / Prettier**: 코드 스타일 (GitHub Actions에서 검사)
- **Steiger**: FSD 구조 검사

> 상태 관리(zustand), 검증(zod) 등은 필요할 때 추가합니다.

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

- Node.js 22.23.4 이상 또는 24.22.1 이상 (2026-10 보안 릴리스 반영 버전)
- 패키지 매니저: [pnpm](https://pnpm.io/) (`package.json`의 `packageManager` 버전 사용)

```bash
pnpm install
cp .env.example .env   # 환경 변수 설정
pnpm dev
```

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 타입 검사 + 프로덕션 빌드 |
| `pnpm lint` | ESLint 검사 |
| `pnpm format` / `pnpm format:check` | Prettier 적용 / 검사 |
| `pnpm steiger` | FSD 구조 검사 |

### 환경 변수

| 변수 | 설명 |
| --- | --- |
| `VITE_API_BASE_URL` | 백엔드 API 주소 (기본 `http://localhost:8000`) |

## 코드 스타일

`main`, `develop` 브랜치로의 push 및 Pull Request 시 GitHub Actions에서 ESLint와 Prettier로 검사합니다.
`package.json`이 추가되기 전까지는 검사를 건너뜁니다.


## 작업 타입

브랜치 이름과 커밋 메시지에 공통으로 사용합니다.

| 타입 | 설명 |
| --- | --- |
| `feat` | 사용자가 인지할 수 있는 새로운 기능 추가 |
| `fix` | 기존 기능이 의도대로 동작하지 않을 때 수정 |
| `refactor` | 기능 개선 없이 내부 코드 구조 개선 |
| `perf` | 성능 개선 |
| `style` | 코드 포맷팅 (세미콜론, 들여쓰기 등. CSS 수정 아님) |
| `docs` | 문서, 주석 수정 |
| `test` | 테스트 코드 추가·수정·삭제 |
| `chore` | 빌드 설정, 패키지 설정, `.gitignore` 등 기타 작업 |
| `ci` | GitHub Actions, Docker 등 CI 설정 변경 |

### 작업 흐름

1. **Jira 티켓 생성**: 하위 작업 또는 태스크 작업 단위 기반
2. **Branch 생성**: 하단 브랜치 생성 방식 참고
3. **Commit**: 하단 커밋 생성 방식 참고. Task 항목 하나 완료 시마다 커밋 권장
4. **Pull Request**: PR 템플릿 형식에 맞게 작성하고, 제목은 `feat(member): 회원가입 구현 #JIRA-1` 처럼 작성

## 브랜치 전략

### 배포 브랜치

| 브랜치 | 배포 환경 | 용도 |
| --- | --- | --- |
| `main` | 운영 서버 | 실제 서비스 운영 (항상 배포 가능한 상태 유지) |
| `develop` | 개발 서버 | 개발자 코드 병합 및 개발 테스트 |

### 작업 브랜치

```
{type}/{jira 티켓번호}-{설명}
```

- 설명은 동사로 시작하는 kebab-case로 작성합니다.
- 예시: `feat/GLOW1-implement-user-email-signup`

### 병합 방식

| 방향 | 방식 | 이유 |
| --- | --- | --- |
| 작업 브랜치 → `develop` | Squash merge | 기능 단위로 커밋을 정리해 히스토리를 단순하게 유지 |
| `develop` → `main` | Merge | 릴리즈 시점을 명확하게 남김 |

## 커밋 컨벤션

### 형식

```
{type}({subject}): {요약} #{Jira 티켓번호}

{필요시 상세 내용}
```

- `type`: [작업 타입](#작업-타입) 참고
- `subject`: 관련 도메인 이름 또는 작업 키워드 (예: `profile`, `auth`)
- 상세 내용은 작업 규모에 따라 자세히 또는 간략히 작성합니다.

### 예시

```
feat(auth): 로그인 후 역할별 페이지 이동 구현 #JIRA-1

- 로그인 성공 시 role에 따라 대시보드로 이동
- 권한 없는 경로 접근 시 리다이렉트
```
