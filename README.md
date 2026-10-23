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

## 예정 폴더 구조

```
glowship-web/
├── .github/
│   └── workflows/
│       └── code-style.yml   # ESLint / Prettier 검사
├── public/                  # 정적 파일
├── src/
│   ├── api/                 # 백엔드(glowship-server) API 호출 모듈
│   ├── assets/              # 이미지, 폰트 등
│   ├── components/          # 재사용 UI 컴포넌트
│   ├── hooks/               # 커스텀 훅
│   ├── pages/               # 페이지(라우트) 단위 컴포넌트
│   ├── styles/              # 전역 스타일
│   ├── utils/               # 공통 유틸 함수
│   ├── App.jsx
│   └── main.jsx
├── .editorconfig
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

> 위 구조는 초안이며, 개발환경 설정 시 확정합니다.

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
