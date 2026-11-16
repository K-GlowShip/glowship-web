/** 사용자가 OS에서 '동작 줄이기'를 켰는지. CSS로 끌 수 없는 JS 애니메이션(숫자 올리기, 차트)이 확인한다. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
