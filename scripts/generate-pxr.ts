import { writeFileSync } from 'node:fs'

const pxToRem = (px: number, base = 16) => `${px / base}rem`
const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i)

const variables = range(1, 1440).map((px) => `  --spacing-${px}pxr: ${pxToRem(px)};`)

writeFileSync(
  new URL('../src/app/styles/pxr.css', import.meta.url),
  `/* scripts/generate-pxr.ts로 생성한 파일입니다. 직접 수정하지 마세요. */\n@theme {\n${variables.join('\n')}\n}\n`,
)
