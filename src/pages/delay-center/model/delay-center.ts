import {
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  formatRoute,
  REGION_LABEL,
  STAGE_LABEL,
  type RegionCode,
} from '@/entities/delay-event'
import {
  DELAY_LIST_FROM_PARAM,
  DELAY_LIST_HAS_FINAL_DECISION_PARAM,
  DELAY_LIST_STATUS_PARAM,
} from '@/shared/config'

import {
  DELAY_STATUS,
  CLIENT_ROLE,
  TRANSPORT_MODE,
  STAGE_CODE,
  OPTION_TYPE,
  FEASIBILITY,
  REASON_CODE,
  RESULT_CLASS,
  RISK_ATTRIBUTION,
  SKU_SCOPE,
  DETAIL_SECTION,
  type DelayStatus,
  type ClientRole,
  type TransportMode,
  type StageCode,
  type OptionType,
  type Feasibility,
  type ReasonCode,
  type ResultClass,
  type RiskAttribution,
  type SkuScope,
  type DetailSection,
} from './delay-center-code'

export * from './delay-center-code'

export { DELAY_STATUS_BADGE_VARIANT, DELAY_STATUS_LABEL, STAGE_LABEL }

export interface DelayOption {
  id: string
  type: OptionType
  feasibility: Feasibility
  reasonCode: ReasonCode | null
  /** 'YYYY-MM-DD'. 판정할 수 없으면 null */
  expectedArrival: string | null
  securableQuantity: number | null
  /** 지연 때문에 위험해진 주문 중 이 대응안으로 납기를 회복하는 주문 수 */
  delayInducedRecoveredOrders: number | null
  /** 대응 후에도 남는 위험 주문 수 */
  notRecoveredOrders: number | null
  /** 남는 위험 주문 중 일부 품목만 확보되어 납기를 못 맞추는 주문 수. 화면에서는 "일부 품목만 확보"로 쓴다(부분 회복이라고 쓰지 않는다). */
  itemSecuredBlockedOrders: number | null
  recommended: boolean
}

export interface RiskOrderLine {
  lineNo: number
  skuCode: string
  productName: string
  openQuantity: number
}

export interface RiskOrder {
  orderCode: string
  /** 위험으로 판정한 사유(`riskReason`) */
  riskReason: string
  attribution: RiskAttribution
  /** 'YYYY-MM-DD' */
  promisedDate: string
  /** 'YYYY-MM-DD' */
  expectedDate: string
  lines: RiskOrderLine[]
}

/** 창고 권역. 대시보드와 같은 값이라 entities/delay-event의 것을 쓴다 */
export type WarehouseRegion = RegionCode

/** SKU·창고 하나의 재고 영향(`inventory_impact_results` 한 행) */
export interface SkuImpact {
  skuCode: string
  productName: string
  region: WarehouseRegion
  scope: SkuScope
  /** 판정할 수 없는 SKU(`NOT_ESTIMABLE`)면 false이고 아래 값은 모두 null */
  estimable: boolean
  /** 지연으로 인한 부족 증가분(지연 반영 부족 − 계획 기준 부족) */
  increasedShortage: number | null
  /** 'YYYY-MM-DD'. 안전재고 아래로 내려가는 날 */
  safetyStockBreachDate: string | null
  /** 'YYYY-MM-DD'. 재고가 바닥나는 날 */
  stockoutDate: string | null
  /** 품절 일수. 품절 구간은 `stockoutDate`부터 이 일수만큼이다. */
  stockoutDays: number | null
}

export interface AiExplanation {
  runSummary: string
  riskSummary: string
  recommendation: string
  warnings: string[]
  /** 대응안별 설명(`option_explanations`). 설명이 없는 대응안은 키가 없다. */
  optionExplanations: Partial<Record<OptionType, string>>
}

export interface DelayAnalysis {
  /** 위험 없음(`NO_RISK`)이면 `PURE_NO_RISK`·`WARNING_NO_RISK`이고, 위험 주문·대응안·설명이 비어 있다. */
  resultClass: ResultClass
  /** SKU·창고별 재고 영향. `SHIPMENT_ONLY`를 뺀 행만 화면에 쓴다. */
  impacts: SkuImpact[]
  riskOrders: RiskOrder[]
  options: DelayOption[]
  /** 설명 검증을 통과하지 못했으면 null */
  explanation: AiExplanation | null
}

export interface MemberOpinion {
  id: string
  author: string
  /** ISO 8601 UTC */
  createdAt: string
  optionId: string | null
  text: string | null
}

export interface FinalDecision {
  author: string
  /** ISO 8601 UTC */
  decidedAt: string
  optionId: string
  reason: string
}

/** 분석 버전 하나(`GET /delay-events/{id}`의 `runs[]`). 의사결정 이력(사람의 판단)과 다른, 시스템의 분석 기록이다. */
export interface AnalysisRunSummary {
  /** 서버가 아직 값을 만들지 않았으면 null */
  runCode: string | null
  versionNo: number
  /** 화면 상태로 바꾼 실행 상태 */
  status: DelayStatus
  /** 보류·실패한 실행의 실패 코드. 그 밖에는 null */
  failureCode: string | null
  /** 가장 최신 버전인지 */
  isLatest: boolean
  /** ISO 8601 UTC */
  startedAt: string
  /** ISO 8601 UTC. 진행 중이면 null */
  finishedAt: string | null
}

export interface DelayCase {
  id: string
  shipmentCode: string
  /** 선적에서 수량이 가장 많은 대표 상품. 선적 상세가 없으면 null */
  productName: string | null
  /** 선적에 담긴 상품(SKU) 수 */
  skuCount: number
  /** 분석 실행 ID(`runCode`). 서버가 아직 값을 만들지 않았으면 null */
  runCode: string | null
  /** 서버가 만든 경로. 출발은 지역 코드 'KR'로 온다. 예: 'KR → LOS ANGELES' */
  route: string
  transportMode: TransportMode
  status: DelayStatus
  delayDays: number
  stage: StageCode
  /** 'YYYY-MM-DD' */
  plannedInbound: string
  /** 'YYYY-MM-DD' */
  expectedInbound: string
  /** ISO 8601 UTC. 이 지연을 처음 감지한 시각 */
  detectedAt: string
  /** ISO 8601 UTC. 지연이 종료된 시각(입고 완료·지연 해소). 열려 있으면 null */
  closedAt: string | null
  /** ISO 8601 UTC. 사용한 수집 중 가장 오래된 시각. 입력이 확정되기 전에는 null */
  baseDataAt: string | null
  /** 입력 확정 때 마지막 수집이 실패·지연이던 원천 안내 */
  dataNotice: string | null
  /** 분석이 진행 중이면 현재 단계 이름 */
  progressStep: string | null
  /** 현재 실행의 실패 코드. 보류·실패일 때만 값이 있고, 설명 생성만 실패했는지 가르는 데 쓴다 */
  failureCode: string | null
  /** 분석 보류·실패 사유 */
  failureMessage: string | null
  /** 자료 변경으로 재분석이 필요할 때 사유 */
  staleReason: string | null
  /** 결과가 없으면(분석 중·보류·실패·지연 해소) null */
  analysis: DelayAnalysis | null
  /** 분석 버전 이력. 최신 버전 먼저 */
  runs: AnalysisRunSummary[]
  opinions: MemberOpinion[]
  finalDecision: FinalDecision | null
}

/** 상태 필터에 보여 주는 옵션. 모든 상태를 고를 수 있게 한다. */
export const DELAY_STATUS_OPTIONS = Object.keys(DELAY_STATUS_LABEL) as DelayStatus[]

/** 운송 수단별로 지나는 단계 순서. 해상은 해상 운송, 항공은 항공 운송을 거친다. */
export const STAGE_FLOW: Record<TransportMode, StageCode[]> = {
  [TRANSPORT_MODE.OCEAN]: [
    STAGE_CODE.PRE_DEPARTURE,
    STAGE_CODE.AT_SEA,
    STAGE_CODE.AT_PORT,
    STAGE_CODE.RECEIVED,
  ],
  [TRANSPORT_MODE.AIR]: [
    STAGE_CODE.PRE_DEPARTURE,
    STAGE_CODE.IN_AIR,
    STAGE_CODE.AT_PORT,
    STAGE_CODE.RECEIVED,
  ],
}

export { formatRoute }

export { OPTION_TYPE_LABEL } from '@/entities/delay-event'

export { FEASIBILITY_BADGE_VARIANT, FEASIBILITY_LABEL, REASON_LABEL } from '@/entities/delay-event'

/**
 * 역할별로 고를 수 있는 대응안. 최종 선택은 실행 가능한 안만 고른다. 초안은 실행 가능 여부를 묻지 않아서
 * 불가·확인 필요인 안도 고를 수 있다(명세 v6.2 4.6).
 */
const SELECTABLE_FEASIBILITY: Record<ClientRole, Feasibility[]> = {
  [CLIENT_ROLE.LEAD]: [FEASIBILITY.FEASIBLE],
  [CLIENT_ROLE.MEMBER]: Object.values(FEASIBILITY),
}

export const getSelectableOptions = (role: ClientRole, options: DelayOption[]) =>
  options.filter((option) => SELECTABLE_FEASIBILITY[role].includes(option.feasibility))

/**
 * 급한 위험 주문이 위로 오게 정렬한다. 지연 유발 위험을 먼저 두고(대응안으로 회복할 수 있는 대상),
 * 약속일이 빠른 순, 같으면 예상 배송일이 더 늦은 순, 그래도 같으면 주문 코드순이다.
 * 정렬 기준은 API 명세에 없는 화면 규칙이다.
 */
export const sortRiskOrders = (orders: RiskOrder[]) =>
  [...orders].sort(
    (a, b) =>
      Number(b.attribution === RISK_ATTRIBUTION.DELAY_INDUCED) -
        Number(a.attribution === RISK_ATTRIBUTION.DELAY_INDUCED) ||
      a.promisedDate.localeCompare(b.promisedDate) ||
      b.expectedDate.localeCompare(a.expectedDate) ||
      a.orderCode.localeCompare(b.orderCode),
  )

/** 귀속별 위험 주문 수 */
export const countRiskOrdersByAttribution = (orders: RiskOrder[]) => ({
  delayInduced: orders.filter(({ attribution }) => attribution === RISK_ATTRIBUTION.DELAY_INDUCED)
    .length,
  preExisting: orders.filter(({ attribution }) => attribution === RISK_ATTRIBUTION.PRE_EXISTING)
    .length,
})

export const ATTRIBUTION_LABEL = {
  [RISK_ATTRIBUTION.DELAY_INDUCED]: '지연 유발',
  [RISK_ATTRIBUTION.PRE_EXISTING]: '기존 위험',
} as const satisfies Record<RiskOrder['attribution'], string>

const UTC_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/

/**
 * 주소의 `from` 값. 서버가 받는 형식(UTC 시각 `YYYY-MM-DDTHH:mm:ssZ`)이 아니면 조건을 쓰지 않는다.
 * 날짜만 있거나 시간대가 없는 값을 그대로 보내면 서버가 422로 거부한다.
 */
export const parseFromParam = (value: string | null) =>
  value !== null && UTC_DATE_TIME_PATTERN.test(value) && !Number.isNaN(Date.parse(value))
    ? value
    : undefined

/** 주소의 `hasFinalDecision` 값. 'true'·'false'가 아니면 조건을 쓰지 않는다. */
export const parseHasFinalDecisionParam = (value: string | null) =>
  value === 'true' ? true : value === 'false' ? false : undefined

/** 종료된 지연(입고 완료·지연 해소). 닫힌 지연의 초안·최종 선택·재분석은 서버가 `EPISODE_CLOSED`로 거부한다. */
export const isClosed = ({ closedAt }: DelayCase) => closedAt !== null

/** 최종 선택이 가능한 상태인지. 선택 대기이고, 설명이 있어야 한다. */
export const canDecide = (delayCase: DelayCase) =>
  !isClosed(delayCase) &&
  delayCase.status === DELAY_STATUS.READY &&
  delayCase.analysis?.explanation != null

/** 상태별 재분석 요청 가능 여부. 분석 중이거나 선택이 끝났으면 요청할 수 없다. 상태를 추가하면 여기도 적어야 컴파일된다. */
const CAN_REANALYZE: Record<DelayStatus, boolean> = {
  [DELAY_STATUS.READY]: true,
  [DELAY_STATUS.ANALYZING]: false,
  [DELAY_STATUS.ON_HOLD]: true,
  [DELAY_STATUS.NEEDS_REANALYSIS]: true,
  [DELAY_STATUS.FINALIZED]: false,
  [DELAY_STATUS.NO_RISK]: true,
  [DELAY_STATUS.NO_DELAY]: false,
}

export const canReanalyze = (delayCase: DelayCase) =>
  !isClosed(delayCase) && CAN_REANALYZE[delayCase.status]

// 표시명은 API 명세 2절 라벨 사전(labels/ko-v1)과 상태별 고정 문구를 그대로 쓴다.
export const RESULT_CLASS_LABEL: Record<ResultClass, string> = {
  [RESULT_CLASS.READY_ORDER_RISK]: '실주문 납기 위험',
  [RESULT_CLASS.FORECAST_ONLY_READY]: '예측 기준 부족 위험',
  [RESULT_CLASS.PURE_NO_RISK]: '지연 영향 없음',
  [RESULT_CLASS.WARNING_NO_RISK]: '지연 영향 없음(기존 부족 있음)',
}

export const RESULT_CLASS_BADGE_VARIANT = {
  [RESULT_CLASS.READY_ORDER_RISK]: 'danger',
  [RESULT_CLASS.FORECAST_ONLY_READY]: 'warning',
  [RESULT_CLASS.PURE_NO_RISK]: 'success',
  [RESULT_CLASS.WARNING_NO_RISK]: 'neutral',
} as const satisfies Record<ResultClass, 'danger' | 'warning' | 'success' | 'neutral'>

export const NO_RISK_MESSAGE: Record<'PURE_NO_RISK' | 'WARNING_NO_RISK', string> = {
  [RESULT_CLASS.PURE_NO_RISK]: '지연으로 늘어나는 부족이 없습니다.',
  [RESULT_CLASS.WARNING_NO_RISK]:
    '지연으로 늘어나는 부족은 없지만, 계획 기준으로 이미 부족한 SKU가 있습니다.',
}

/** 계획 유지는 항상 가능한 기준선이라, 그 밖에 실행 가능한 대응안이 하나도 없는지 본다. */
export const hasNoFeasibleOption = (options: DelayOption[]) =>
  !options.some(
    (option) =>
      option.type !== OPTION_TYPE.KEEP_PLAN && option.feasibility === FEASIBILITY.FEASIBLE,
  )

const MISSING_DATA_REASONS: ReasonCode[] = [
  REASON_CODE.MISSING_OPERATING_RULE,
  REASON_CODE.MISSING_REQUIRED_DATA,
]

/** 운영 기준·필수 자료가 없어 판정하지 못한(`확인 필요`) 대응안 */
export const getOptionsMissingData = (options: DelayOption[]) =>
  options.filter((option) => option.reasonCode && MISSING_DATA_REASONS.includes(option.reasonCode))

export const WAREHOUSE_LABEL = REGION_LABEL

const NO_DATE = '9999-12-31'

/** 가장 먼저 문제가 생기는 날. 소진일이 있으면 소진일, 없으면 안전재고 하회일 */
const getFirstTroubleDate = (impact: SkuImpact) =>
  impact.stockoutDate ?? impact.safetyStockBreachDate ?? NO_DATE

/**
 * 화면에 보여 줄 재고 영향 행. 지연 선적에만 있는 SKU는 빼고, 영향이 있는 SKU, 판정 가능한 SKU,
 * 문제가 먼저 생기는 SKU 순서로 둔다. 맨 앞이 대표 상품이다.
 */
export const getVisibleImpacts = (impacts: SkuImpact[]) =>
  impacts
    .filter((impact) => impact.scope !== SKU_SCOPE.SHIPMENT_ONLY)
    .sort(
      (a, b) =>
        Number(b.scope === SKU_SCOPE.IMPACTED) - Number(a.scope === SKU_SCOPE.IMPACTED) ||
        Number(b.estimable) - Number(a.estimable) ||
        getFirstTroubleDate(a).localeCompare(getFirstTroubleDate(b)),
    )

const sumShortage = (impacts: SkuImpact[]) =>
  impacts.reduce((sum, impact) => sum + (impact.increasedShortage ?? 0), 0)

/** 지연으로 인한 부족 증가분. `IMPACTED` 행만 더한다(기준선 부족이 섞이지 않게 지연 증분만 쓴다). */
export const getIncreasedShortage = (impacts: SkuImpact[]) =>
  sumShortage(impacts.filter((impact) => impact.scope === SKU_SCOPE.IMPACTED))

export const NO_SECTIONS: DetailSection[] = [DETAIL_SECTION.HISTORY]
export const NO_RISK_SECTIONS: DetailSection[] = [DETAIL_SECTION.IMPACT, DETAIL_SECTION.HISTORY]
export const FULL_SECTIONS: DetailSection[] = [
  DETAIL_SECTION.IMPACT,
  DETAIL_SECTION.RISK_ORDERS,
  DETAIL_SECTION.OPTIONS,
  DETAIL_SECTION.EXPLANATION,
  DETAIL_SECTION.DECISION,
  DETAIL_SECTION.HISTORY,
]

/**
 * 상태별로 상세에 보여 줄 섹션과 순서. 재고 영향 → 위험 주문 → 대응안 비교 → 설명 → 선택 순서(serviceflow 3~4단계).
 * 결과가 없으면(분석 중·보류·실패·지연 해소) 섹션 없이 안내만 보여 준다. 위험 없음은 재고 영향만 있다.
 */
export const getDetailSections = ({ status, analysis }: DelayCase) => {
  if (!analysis) {
    return NO_SECTIONS
  }
  return status === DELAY_STATUS.NO_RISK ? NO_RISK_SECTIONS : FULL_SECTIONS
}

/** 목록의 검색 조건을 담는 주소 파라미터 이름. 상세에서 돌아올 때 조건이 유지되도록 주소에 담는다. */
export const LIST_PARAM = {
  KEYWORD: 'q',
  STATUS: DELAY_LIST_STATUS_PARAM,
  FROM: DELAY_LIST_FROM_PARAM,
  HAS_FINAL_DECISION: DELAY_LIST_HAS_FINAL_DECISION_PARAM,
  PAGE: 'page',
} as const

export const DELAY_PAGE_SIZE = 10

/** 목록에서 상세로 이동할 때 함께 넘기는 값. 상세의 '목록으로' 링크가 검색 조건을 되살리는 데 쓴다. */
export interface DelayListLocationState {
  /** 목록 주소의 `?` 뒤 문자열. 예: 'status=ready&page=2' */
  listSearch: string
}

/** 이동 상태에서 목록 검색 조건을 읽는다. 목록을 거치지 않고 들어왔으면 빈 문자열이다. */
export const getListSearch = (state: unknown) =>
  typeof state === 'object' &&
  state !== null &&
  'listSearch' in state &&
  typeof state.listSearch === 'string'
    ? state.listSearch
    : ''
