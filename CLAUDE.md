# glowship-web

- 크기(너비, 높이, 간격 등)는 `px` 대신 `pxr` 클래스를 씁니다. 예: `w-400pxr`, `p-16pxr`. `w-[400px]` 금지. 상세 규칙: [docs/pxr-unit.md](docs/pxr-unit.md)
- 글자 크기는 `text-h1`, `text-b1` 등 토큰을 씁니다. (`src/app/styles/index.css`의 `@theme`)
- Tailwind v4라서 `tailwind.config.ts` 없이 CSS에서 설정합니다.
- 폴더 구조와 import 규칙은 [docs/folder-structure.md](docs/folder-structure.md)를 따릅니다.
