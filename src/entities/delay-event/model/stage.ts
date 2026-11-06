/** 선적의 운송 단계 코드값(API 명세 v6.2 2절) */
export const STAGE_CODE = {
  PRE_DEPARTURE: 'PRE_DEPARTURE',
  AT_SEA: 'AT_SEA',
  IN_AIR: 'IN_AIR',
  AT_PORT: 'AT_PORT',
  RECEIVED: 'RECEIVED',
} as const

export type StageCode = (typeof STAGE_CODE)[keyof typeof STAGE_CODE]

export const STAGE_LABEL: Record<StageCode, string> = {
  [STAGE_CODE.PRE_DEPARTURE]: '출항 전',
  [STAGE_CODE.AT_SEA]: '해상 운송',
  [STAGE_CODE.IN_AIR]: '항공 운송',
  [STAGE_CODE.AT_PORT]: '항구 도착·통관 중',
  [STAGE_CODE.RECEIVED]: '입고 완료',
}

/** 서버가 새 운송 단계를 추가해도 화면이 깨지지 않게, 라벨이 없으면 코드를 그대로 보여 준다. */
export const getStageLabel = (stage: string) => STAGE_LABEL[stage as StageCode] ?? stage
