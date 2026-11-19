// 분석 결과의 코드값(API 명세 v6.2 2절). 지연 대응 센터와 의사결정 이력이 같이 쓴다.

/** 결과 분류(`resultClass`) */
export const RESULT_CLASS = {
  READY_ORDER_RISK: 'READY_ORDER_RISK',
  FORECAST_ONLY_READY: 'FORECAST_ONLY_READY',
  PURE_NO_RISK: 'PURE_NO_RISK',
  WARNING_NO_RISK: 'WARNING_NO_RISK',
} as const

export type ResultClass = (typeof RESULT_CLASS)[keyof typeof RESULT_CLASS]

/** 위험 귀속(`riskAttribution`): 지연 때문인 주문과 원래 위험하던 주문 */
export const RISK_ATTRIBUTION = {
  DELAY_INDUCED: 'DELAY_INDUCED',
  PRE_EXISTING: 'PRE_EXISTING',
} as const

export type RiskAttribution = (typeof RISK_ATTRIBUTION)[keyof typeof RISK_ATTRIBUTION]
