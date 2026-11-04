// 서버 코드값과 화면 구분값. 같은 slice의 다른 model 파일을 가져오지 않아 순환하지 않는다.
// 지연 상태·운송 단계는 대시보드와 함께 쓰는 값이라 entities/delay-event에서 가져와 다시 내보낸다.
import { DELAY_STATUS, STAGE_CODE, type DelayStatus, type StageCode } from '@/entities/delay-event'

export { DELAY_STATUS, STAGE_CODE, type DelayStatus, type StageCode }

/** 상태 필터에서 모든 상태를 보여 주는 값(명세 4.4의 `ALL` 탭) */
export const STATUS_FILTER_ALL = 'ALL'

export type DelayStatusFilter = DelayStatus | typeof STATUS_FILTER_ALL

/** 로그인 사용자의 역할(명세 6절). 초안은 팀원, 최종 선택은 팀장만 한다. */
export const CLIENT_ROLE = {
  MEMBER: 'CLIENT_MEMBER',
  LEAD: 'CLIENT_LEAD',
} as const

export type ClientRole = (typeof CLIENT_ROLE)[keyof typeof CLIENT_ROLE]

export const TRANSPORT_MODE = {
  OCEAN: 'OCEAN',
  AIR: 'AIR',
} as const

export type TransportMode = (typeof TRANSPORT_MODE)[keyof typeof TRANSPORT_MODE]

export const OPTION_TYPE = {
  KEEP_PLAN: 'KEEP_PLAN',
  PRE_DEPARTURE_AIR: 'PRE_DEPARTURE_AIR',
  KR_AIR_REPLENISH: 'KR_AIR_REPLENISH',
  OTHER_REGION_FULFILL: 'OTHER_REGION_FULFILL',
} as const

export type OptionType = (typeof OPTION_TYPE)[keyof typeof OPTION_TYPE]

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

/** 재고 영향의 범위. 지연 증분이 있거나 위험 주문에 들어간 SKU(`IMPACTED`), 증분은 없지만 안전재고 아래로 내려가는 SKU(`WATCH`), 지연 선적에만 있는 나머지(`SHIPMENT_ONLY`) */
export const SKU_SCOPE = {
  IMPACTED: 'IMPACTED',
  WATCH: 'WATCH',
  SHIPMENT_ONLY: 'SHIPMENT_ONLY',
} as const

export type SkuScope = (typeof SKU_SCOPE)[keyof typeof SKU_SCOPE]

export const DETAIL_SECTION = {
  IMPACT: 'impact',
  RISK_ORDERS: 'riskOrders',
  OPTIONS: 'options',
  EXPLANATION: 'explanation',
  DECISION: 'decision',
  HISTORY: 'history',
} as const

export type DetailSection = (typeof DETAIL_SECTION)[keyof typeof DETAIL_SECTION]
