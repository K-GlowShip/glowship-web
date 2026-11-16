/**
 * 분석이 끝났는지 다시 읽는 간격. 시작한 지 얼마 안 됐을 때는 짧게 읽어 빨리 끝난 결과가 바로 뜨게 하고,
 * 오래 걸릴수록 간격을 늘려 서버에 보내는 요청을 줄인다. 분석 제한 시간(`ANALYSIS_POLL_LIMIT_MS`)이 지나면 읽기를 멈춘다.
 */
const POLL_STAGES = [
  { untilMs: 20_000, intervalMs: 1_500 },
  { untilMs: 60_000, intervalMs: 3_000 },
] as const

const LATE_POLL_INTERVAL_MS = 5_000

/** 분석을 기다리기 시작한 지 `elapsedMs`가 지났을 때 다시 읽을 간격 */
export const getAnalysisPollInterval = (elapsedMs: number) =>
  POLL_STAGES.find(({ untilMs }) => elapsedMs < untilMs)?.intervalMs ?? LATE_POLL_INTERVAL_MS
