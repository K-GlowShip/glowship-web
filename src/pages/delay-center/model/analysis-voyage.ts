/** 분석 중 화면(작은 항해)에서 정거장은 항로 위에 같은 간격으로 놓인다. entities/delay-event의 운송 단계 표시와 같은 규칙이다 */
export const toStopPosition = (index: number, stopCount: number) =>
  `${(index / (stopCount - 1)) * 100}%`

/** 기다리는 동안 탈것이 다음 정거장 쪽으로 가는 거리(구간의 몇 %까지). 서버가 다음 단계를 알려 주기 전에는 정거장에 닿지 않는다 */
export const CREEP_RATIO = 0.85

/** 한 구간을 CREEP_RATIO까지 가는 데 걸리는 시간. 실제 단계 시간이 아니라 "일하는 중"이라는 느낌을 위한 추정이다 */
export const CREEP_DURATION_MS = 20_000

/** 지금 정거장에서 다음 정거장 쪽으로 천천히 나아간 위치. 마지막 정거장은 더 갈 곳이 없어 그대로다 */
export const toCreepPosition = (index: number, stopCount: number) =>
  toStopPosition(index < stopCount - 1 ? index + CREEP_RATIO : index, stopCount)
