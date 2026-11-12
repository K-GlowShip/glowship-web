import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import { ENDPOINT } from '../paths'
import type {
  ResponseOptionSummary,
  ShipmentSummary,
  SkuSummary,
  UserSummary,
  WarehouseSummary,
} from '../summary'

export interface MemberDraft {
  memberDraftId: string
  author: UserSummary
  /** 의견만 쓴 초안이면 null */
  responseOption: ResponseOptionSummary | null
  opinionText: string | null
  /** ISO 8601 UTC */
  createdAt: string
}

export interface FinalDecision {
  finalDecisionId: string
  decidedBy: UserSummary
  responseOption: ResponseOptionSummary
  reasonText: string
  /** ISO 8601 UTC */
  decidedAt: string
  checkedSeq: number
}

/** 분석 실행의 상태 코드(`status`). 진행 중인 단계가 앞의 다섯 개다 */
export const ANALYSIS_RUN_STATUS = {
  DETECTED: 'DETECTED',
  VALIDATING: 'VALIDATING',
  ANALYZING_IMPACT: 'ANALYZING_IMPACT',
  ANALYZING_OPTIONS: 'ANALYZING_OPTIONS',
  VALIDATING_OUTPUT: 'VALIDATING_OUTPUT',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  NO_DELAY: 'NO_DELAY',
  NO_RISK: 'NO_RISK',
  ON_HOLD: 'ON_HOLD',
  FAILED: 'FAILED',
  STALE: 'STALE',
  FINALIZED: 'FINALIZED',
} as const

/** 재고 영향의 범위. 지연 증분이 있거나 위험 주문에 들어간 SKU(`IMPACTED`), 증분은 없지만 안전재고 아래로 내려가는 SKU(`WATCH`), 지연 선적에만 있는 나머지(`SHIPMENT_ONLY`) */
export const SKU_SCOPE = {
  IMPACTED: 'IMPACTED',
  WATCH: 'WATCH',
  SHIPMENT_ONLY: 'SHIPMENT_ONLY',
} as const

export type SkuScope = (typeof SKU_SCOPE)[keyof typeof SKU_SCOPE]

/** 저장된 `explanation.v1` JSON. 감싸는 필드만 camelCase이고 안쪽은 저장된 키(snake_case) 그대로다. */
export interface RunExplanation {
  schema_version: string
  language: string
  analysis_run_id: string
  /** 분석 요약(1~2문장) */
  run_summary: string
  /** 영향 요약(1~3문장) */
  risk_summary: string
  /** 대응안마다 한 건. 후보 대응안 전부를 고정 순서로 준다 */
  option_explanations: { option_type: string; text: string }[]
  recommendation_explanation: string
  /** `code`: `FORECAST_EVENT_OVERLAP`·`BASELINE_SHORTAGE_EXISTS`·`OPTION_NEEDS_CHECK`·`SKU_NOT_ESTIMABLE` */
  warnings: { code: string; text: string }[]
  /** 문장 속 근거 표지 `[E1]`…이 가리키는 값. 화면에는 표지를 숨기거나 근거 보기로 연결한다 */
  evidence_references: { id: string; path: string; value: string | number | null }[]
  model_provider: string
  model_id: string
  /** ISO 8601 UTC */
  generated_at: string
}

/** 공여 창고 계산(`OTHER_REGION_FULFILL`). `NOT_ESTIMABLE`이면 `next_inbound_date`가 null */
export interface SkuResultDonor {
  source_warehouse_id: string
  next_inbound_date: string | null
  on_hand: number
  reserved: number
  open_commitment_net: number
  safety_stock_quantity: number
  transferable_quantity: number | null
  forecast_securable_quantity: number | null
}

/** 대응안 하나의 SKU별 효과. `sku_results.v1` 저장 JSON의 한 항목(snake_case 그대로) */
export interface SkuResultItem {
  sku_id: string
  /** `IMPACTED`·`WATCH`·`SHIPMENT_ONLY` */
  sku_scope: string
  /** `EVALUATED`·`NOT_ESTIMABLE`·`NOT_APPLICABLE` */
  evaluation_status: string
  /** `DONOR_NO_NEXT_INBOUND`·`MISSING_OPERATING_RULE`·`MISSING_REQUIRED_DATA` */
  not_estimable_reason: string | null
  baseline_prepare_quantity: number | null
  increment_prepare_quantity: number | null
  reduction_committed_quantity: number | null
  residual_prepare_quantity: number | null
  supply_quantity: number | null
  supply_available_date: string | null
  donor: SkuResultDonor | null
}

export interface SkuResults {
  schema_version: string
  unit: string
  items: SkuResultItem[]
}

/** 분석 대상 지연. 지연 목록·상세(4.4)와 같은 값이다 */
export interface AnalysisTarget {
  delayEventId: string
  episodeNo: number
  shipment: ShipmentSummary
  /** 도착 창고 */
  warehouse: WarehouseSummary
  representativeSku: SkuSummary | null
  route: string
  stage: string
  /** `YYYY-MM-DD` */
  planned3plInboundDate: string
  expected3plInboundDate: string
  delayDays: number
}

export interface AnalysisDataVersion {
  dataSyncRunId: string
  sourceDomain: string
  /** ISO 8601 UTC */
  finishedAt: string | null
}

export interface AnalysisInputBasis {
  inputSeq: number
  /** 분석 기준일 D(`YYYY-MM-DD`). 보류·실패이거나 진행 중에 `STALE`이 된 실행은 null */
  baseDate: string | null
  operatingRuleSetId: string
  operatingRuleVersionNo: number
  calculationContractVersion: string
  allocationRuleVersion: string
  /** 입력에 쓴 수집 목록 */
  dataVersions: AnalysisDataVersion[]
  /** 분석이 쓴 데이터의 기준 시각(사용한 수집 중 가장 오래된 시각). ISO 8601 UTC */
  dataBasisAt: string | null
  dataWarnings: { sourceDomain: string; lastStatus: string; lastFinishedAt: string | null }[]
}

/**
 * SKU·창고별 재고 영향. 기준선(`baseline~`)은 계획대로 입고했을 때, 나머지는 예상 입고일을 반영한 값이다.
 * 날짜·일수·부족 수량은 구간 `[D, E)`에서 계산한다(명세 C33).
 */
export interface InventoryImpact {
  sku: SkuSummary
  warehouse: WarehouseSummary
  /** `IMPACTED`·`WATCH`·`SHIPMENT_ONLY` */
  skuScope: string
  /** `CALCULATED`·`NOT_ESTIMABLE` */
  calculationStatus: string
  forecastMethod: string
  availableQuantity: number
  committedOpenQuantity: number | null
  /** `ORDER_DEMAND`·`OUTBOUND` */
  salesBasisType: string
  salesBasisDays: number
  salesBasisStartDate: string | null
  salesBasisEndDate: string | null
  salesBasisEventDays: number | null
  salesBasisEventNames: string[] | null
  averageDailySales: number | null
  safetyStockDays: number
  safetyStockQuantity: number | null
  baselinePlanned3plInboundDate: string
  expected3plInboundDate: string
  baselineSafetyStockBreachDate: string | null
  baselineStockoutDate: string | null
  baselineStockoutDays: number | null
  baselineShortageQuantity: number | null
  safetyStockBreachDate: string | null
  stockoutDate: string | null
  stockoutDays: number | null
  shortageQuantity: number | null
}

export interface AtRiskOrderLine {
  atRiskOrderId: string
  orderLineId: string
  lineNo: number
  sku: SkuSummary
  openQuantity: number
  /** `DIRECT_SKU_SHORTAGE`·`BUNDLED_ORDER_WAIT` */
  waitCause: string | null
}

/** 위험 주문. 주문 단위로 한 항목이고, 줄은 `lines`에 있다 */
export interface AtRiskOrder {
  orderId: string
  orderCode: string
  /** `PRE_EXISTING`·`DELAY_INDUCED` */
  riskAttribution: string
  /** ISO 8601 UTC */
  promisedDeliveryAt: string
  baselineExpectedDeliveryAt: string | null
  expectedDeliveryAt: string
  /** 예상 납품이 계산 범위 밖인지 */
  isBeyondHorizon: boolean
  riskReason: string
  lines: AtRiskOrderLine[]
}

/** 대응안별 주문 결과 */
export interface OptionOrderOutcome {
  atRiskOrderId: string
  /** `RECOVERED`·`NOT_RECOVERED` */
  outcome: string
  notRecoveredReason: string | null
  /** `FULLY_SECURED`·`PARTIALLY_SECURED`·`NOT_SECURED` */
  lineSecurementStatus: string
  securedQuantity: number
  recoveredQuantity: number
  /** ISO 8601 UTC */
  expectedDeliveryAt: string | null
  /** 공급 창고가 없으면 null */
  sourceWarehouse: WarehouseSummary | null
  /** `EXISTING_STOCK`·`OTHER_REGION_WAREHOUSE`·`KR_AIR`·`PRE_DEPARTURE_AIR` */
  supplySource: string | null
}

/**
 * 대응안 비교의 한 행. 판정할 수 없거나 사전 조건이 실패하면 주문 집계는 null이다(명세 4.5 집계 규칙).
 * 비용 필드는 없다.
 */
export interface ResponseOption {
  responseOptionId: string
  /** `KEEP_PLAN`·`PRE_DEPARTURE_AIR`·`KR_AIR_REPLENISH`·`OTHER_REGION_FULFILL` */
  optionType: string
  /** `FEASIBLE`·`NOT_FEASIBLE`·`NEEDS_CHECK` */
  feasibilityStatus: string
  /** `FEASIBLE`이면 null. 화면 문구는 코드로 만든다 */
  reasonCode: string | null
  requiredQuantity: number
  securableQuantity: number | null
  reductionCommittedTotal: number | null
  expectedDeliveryDate: string | null
  fullyRecoveredOrders: number | null
  delayInducedRecoveredOrders: number | null
  itemSecuredBlockedOrders: number | null
  notRecoveredOrders: number | null
  recommendationRank: number | null
  isRecommended: boolean
  /** 저장값을 읽지 못하면 null */
  skuResults: SkuResults | null
  outcomes: OptionOrderOutcome[]
}

/**
 * 분석 실행 상세(명세 4.5). 상태에 따라 결과가 없으면 목록은 `[]`, 객체는 `null`이다.
 * 결과가 있는 상태는 `READY_FOR_REVIEW`·`NO_RISK`(재고 영향만)·`STALE`·`FINALIZED`다.
 */
export interface AnalysisRunDetail {
  // 실행
  runId: string
  runCode: string | null
  versionNo: number
  parentRunId: string | null
  isLatest: boolean
  status: string
  completedStatus: string | null
  resultClass: string | null
  statusReason: string | null
  /** `AUTO`·`REANALYSIS` */
  triggerType: string
  triggerReason: string
  /** 자동 실행이면 null */
  requestedBy: UserSummary | null
  requestReason: string | null
  /** ISO 8601 UTC */
  requestedAt: string | null
  startedAt: string
  finishedAt: string | null

  // STALE(`STALE`일 때만 값이 있고, 아니면 목록은 `[]`)
  staleDetectedAt: string | null
  stalePrimaryReason: string | null
  staleReasonCodes: string[]

  target: AnalysisTarget
  inputBasis: AnalysisInputBasis

  // 결과
  inventoryImpacts: InventoryImpact[]
  atRiskOrders: AtRiskOrder[]
  responseOptions: ResponseOption[]

  // AI 설명(`explanationValidationStatus`가 `PASSED`일 때만 `explanation`이 있다)
  explanation: RunExplanation | null
  /** `PASSED`·`FAILED` */
  explanationValidationStatus: string | null
  explanationGeneratedAt: string | null
  modelName: string | null
  promptVersion: string | null

  // 실패 요약(`ON_HOLD`·`FAILED`일 때만 값이 있다)
  failedStep: string | null
  failureCode: string | null
  attemptCount: number | null
  isRetryExhausted: boolean | null
  failureMessage: string | null

  // 판단 이력
  drafts: MemberDraft[]
  finalDecision: FinalDecision | null
}

/** 없는 실행·다른 고객사 실행은 404 `ANALYSIS_RUN_NOT_FOUND` */
export const getAnalysisRun = (runId: string, config?: AxiosRequestConfig) =>
  API.get<AnalysisRunDetail>(`${ENDPOINT.ANALYSIS_RUNS}/${encodeURIComponent(runId)}`, config)

export interface CreateMemberDraftRequest {
  /** 같은 실행의 대응안이면 실행 가능 여부와 상관없이 고를 수 있다(명세 C24) */
  responseOptionId?: string
  /** 앞뒤 공백을 뺀 뒤 1~600자(명세 C25). 대응안과 의견 중 하나는 있어야 한다 */
  opinionText?: string
}

export interface CreatedMemberDraft {
  memberDraftId: string
  /** ISO 8601 UTC */
  createdAt: string
}

/** 팀원의 의견·초안 저장. 팀장은 403이다 */
export const createMemberDraft = (runId: string, body: CreateMemberDraftRequest) =>
  API.post<CreatedMemberDraft, CreateMemberDraftRequest>(
    `${ENDPOINT.ANALYSIS_RUNS}/${encodeURIComponent(runId)}/drafts`,
    body,
  )

export interface CreateFinalDecisionRequest {
  /** 실행 가능(`FEASIBLE`)한 대응안만 고를 수 있다 */
  responseOptionId: string
  /** 앞뒤 공백을 뺀 뒤 1~600자(명세 C25) */
  reasonText: string
}

export interface CreatedFinalDecision {
  finalDecisionId: string
  /** ISO 8601 UTC */
  decidedAt: string
  checkedSeq: number
  /** 항상 `FINALIZED` */
  status: string
}

/**
 * 팀장의 최종 선택. 팀원은 403이다.
 * `idempotencyKey`가 같으면 같은 본문의 재시도로 보고 저장된 결과를 돌려준다. 같은 키에 다른 본문이면 409 `IDEMPOTENCY_KEY_REUSED`다.
 */
export const createFinalDecision = (
  runId: string,
  body: CreateFinalDecisionRequest,
  idempotencyKey: string,
) =>
  API.post<CreatedFinalDecision, CreateFinalDecisionRequest>(
    `${ENDPOINT.ANALYSIS_RUNS}/${encodeURIComponent(runId)}/final-decision`,
    body,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  )
