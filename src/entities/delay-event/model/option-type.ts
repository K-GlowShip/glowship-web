/** 대응안 유형 코드값(API 명세 v6.2 2절). 지연 대응 센터와 의사결정 이력이 함께 쓴다. */
export const OPTION_TYPE = {
  KEEP_PLAN: 'KEEP_PLAN',
  PRE_DEPARTURE_AIR: 'PRE_DEPARTURE_AIR',
  KR_AIR_REPLENISH: 'KR_AIR_REPLENISH',
  OTHER_REGION_FULFILL: 'OTHER_REGION_FULFILL',
} as const

export type OptionType = (typeof OPTION_TYPE)[keyof typeof OPTION_TYPE]

// 표시명은 API 명세 2절 라벨 사전(labels/ko-v1)을 그대로 쓴다.
export const OPTION_TYPE_LABEL: Record<OptionType, string> = {
  [OPTION_TYPE.KEEP_PLAN]: '현재 계획 유지',
  [OPTION_TYPE.PRE_DEPARTURE_AIR]: '출항 전 항공 전환',
  [OPTION_TYPE.KR_AIR_REPLENISH]: '한국 창고 항공 보충',
  [OPTION_TYPE.OTHER_REGION_FULFILL]: '다른 권역 창고 출고',
}

/** 서버가 새 대응안 유형을 추가해도 화면이 깨지지 않게, 라벨이 없으면 코드를 그대로 보여 준다. */
export const getOptionTypeLabel = (optionType: string) =>
  OPTION_TYPE_LABEL[optionType as OptionType] ?? optionType
