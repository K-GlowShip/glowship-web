// 서버 코드값과 화면 구분값. 다른 model 파일이 서로 가져오다 순환하지 않도록 아무것도 가져오지 않는다.

/**
 * 서버 `GET /delay-events` 탭(현재 실행 상태)에 최종 선택 완료, 위험 없음(`NO_RISK`), 지연 해소(`NO_DELAY`)를 더한 구분.
 * 위험 없음·지연 해소는 서버 탭 표(4.4)에 없는 제안이다. 서버 연동 때 `status` 값을 맞춰야 한다.
 */
export const DELAY_STATUS = {
  READY: 'ready',
  ANALYZING: 'analyzing',
  ON_HOLD: 'on_hold',
  NEEDS_REANALYSIS: 'needs_reanalysis',
  FINALIZED: 'finalized',
  NO_RISK: 'no_risk',
  NO_DELAY: 'no_delay',
} as const

export type DelayStatus = (typeof DELAY_STATUS)[keyof typeof DELAY_STATUS]

/** 상태 필터에서 모든 상태를 보여 주는 값 */
export const STATUS_FILTER_ALL = 'all'

export type DelayStatusFilter = DelayStatus | typeof STATUS_FILTER_ALL

/** 로그인 사용자의 역할. 초안은 팀원, 최종 선택은 팀장만 한다. */
export const CLIENT_ROLE = {
  MEMBER: 'member',
  LEAD: 'lead',
} as const

export type ClientRole = (typeof CLIENT_ROLE)[keyof typeof CLIENT_ROLE]

export const TRANSPORT_MODE = {
  OCEAN: 'OCEAN',
  AIR: 'AIR',
} as const

export type TransportMode = (typeof TRANSPORT_MODE)[keyof typeof TRANSPORT_MODE]

export const STAGE_CODE = {
  PRE_DEPARTURE: 'PRE_DEPARTURE',
  AT_SEA: 'AT_SEA',
  IN_AIR: 'IN_AIR',
  AT_PORT: 'AT_PORT',
  RECEIVED: 'RECEIVED',
} as const

export type StageCode = (typeof STAGE_CODE)[keyof typeof STAGE_CODE]

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
  DELAY_INDUCED: 'delay_induced',
  PRE_EXISTING: 'pre_existing',
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
