// 서버 코드값과 화면 구분값. 같은 slice의 다른 model 파일을 가져오지 않아 순환하지 않는다.
// 지연 상태·운송 단계·운송 수단은 대시보드와 함께 쓰는 값이라 entities/delay-event에서 가져와 다시 내보낸다.
import {
  DELAY_STATUS,
  STAGE_CODE,
  TRANSPORT_MODE,
  type DelayStatus,
  type StageCode,
  type TransportMode,
} from '@/entities/delay-event'

export {
  DELAY_STATUS,
  STAGE_CODE,
  TRANSPORT_MODE,
  type DelayStatus,
  type StageCode,
  type TransportMode,
}

/** 상태 필터에서 모든 상태를 보여 주는 값(명세 4.4의 `ALL` 탭) */
export const STATUS_FILTER_ALL = 'ALL'

export type DelayStatusFilter = DelayStatus | typeof STATUS_FILTER_ALL

/**
 * 분석 실행의 실패 코드(`failureCode`, 보류·실패일 때만 값이 있다). 값은 엔진이 정하는 열린 목록이라 화면이 구분해야 하는 것만 둔다.
 * 설명 생성만 실패한 경우는 계산 결과가 있고, 그 밖의 실패는 결과가 없다(명세 4.5).
 */
export const FAILURE_CODE = {
  EXPLANATION_GENERATION_FAILED: 'EXPLANATION_GENERATION_FAILED',
} as const

/** 로그인 사용자의 역할(명세 6절). 초안은 팀원, 최종 선택은 팀장만 한다. */
export const CLIENT_ROLE = {
  MEMBER: 'CLIENT_MEMBER',
  LEAD: 'CLIENT_LEAD',
} as const

export type ClientRole = (typeof CLIENT_ROLE)[keyof typeof CLIENT_ROLE]

export { OPTION_TYPE, type OptionType } from '@/entities/delay-event'

export const FEASIBILITY = {
  FEASIBLE: 'FEASIBLE',
  NOT_FEASIBLE: 'NOT_FEASIBLE',
  NEEDS_CHECK: 'NEEDS_CHECK',
} as const

export type Feasibility = (typeof FEASIBILITY)[keyof typeof FEASIBILITY]

export const REASON_CODE = {
  ARRIVES_AFTER_DELAYED_SHIPMENT: 'ARRIVES_AFTER_DELAYED_SHIPMENT',
  NO_KR_ELIGIBLE_STOCK: 'NO_KR_ELIGIBLE_STOCK',
  NO_TRANSFERABLE_STOCK: 'NO_TRANSFERABLE_STOCK',
  PROMISE_UNREACHABLE_LEADTIME: 'PROMISE_UNREACHABLE_LEADTIME',
  DONOR_NO_NEXT_INBOUND: 'DONOR_NO_NEXT_INBOUND',
  FORECAST_EFFECT_BELOW_ONE_UNIT: 'FORECAST_EFFECT_BELOW_ONE_UNIT',
  NO_RECOVERY_EFFECT: 'NO_RECOVERY_EFFECT',
  MISSING_OPERATING_RULE: 'MISSING_OPERATING_RULE',
  MISSING_REQUIRED_DATA: 'MISSING_REQUIRED_DATA',
} as const

export type ReasonCode = (typeof REASON_CODE)[keyof typeof REASON_CODE]

export const RESULT_CLASS = {
  READY_ORDER_RISK: 'READY_ORDER_RISK',
  FORECAST_ONLY_READY: 'FORECAST_ONLY_READY',
  PURE_NO_RISK: 'PURE_NO_RISK',
  WARNING_NO_RISK: 'WARNING_NO_RISK',
} as const

export type ResultClass = (typeof RESULT_CLASS)[keyof typeof RESULT_CLASS]

export const RISK_ATTRIBUTION = {
  DELAY_INDUCED: 'DELAY_INDUCED',
  PRE_EXISTING: 'PRE_EXISTING',
} as const

export type RiskAttribution = (typeof RISK_ATTRIBUTION)[keyof typeof RISK_ATTRIBUTION]

export { SKU_SCOPE, type SkuScope } from '@/shared/api'

export const DETAIL_SECTION = {
  IMPACT: 'impact',
  RISK_ORDERS: 'riskOrders',
  OPTIONS: 'options',
  EXPLANATION: 'explanation',
  DECISION: 'decision',
  HISTORY: 'history',
} as const

export type DetailSection = (typeof DETAIL_SECTION)[keyof typeof DETAIL_SECTION]
