import { EMPTY_TEXT } from './delay-center-text'

/**
 * 서버 `GET /delay-events` 탭(현재 실행 상태)에 최종 선택 완료, 위험 없음(`NO_RISK`), 지연 해소(`NO_DELAY`)를 더한 구분.
 * 위험 없음·지연 해소는 서버 탭 표(4.4)에 없는 제안이다. 서버 연동 때 `status` 값을 맞춰야 한다.
 */
export type DelayStatus =
  'ready' | 'analyzing' | 'on_hold' | 'needs_reanalysis' | 'finalized' | 'no_risk' | 'no_delay'

export type DelayStatusFilter = DelayStatus | 'all'

/** 로그인 사용자의 역할. 초안은 팀원, 최종 선택은 팀장만 한다. */
export type ClientRole = 'member' | 'lead'

export type TransportMode = 'OCEAN' | 'AIR'

export type StageCode = 'PRE_DEPARTURE' | 'AT_SEA' | 'IN_AIR' | 'AT_PORT' | 'RECEIVED'

export type OptionType =
  'KEEP_PLAN' | 'PRE_DEPARTURE_AIR' | 'KR_AIR_REPLENISH' | 'OTHER_REGION_FULFILL'

export type Feasibility = 'FEASIBLE' | 'NOT_FEASIBLE' | 'NEEDS_CHECK'

export type ReasonCode =
  | 'ARRIVES_AFTER_DELAYED_SHIPMENT'
  | 'NO_KR_ELIGIBLE_STOCK'
  | 'NO_TRANSFERABLE_STOCK'
  | 'PROMISE_UNREACHABLE_LEADTIME'
  | 'DONOR_NO_NEXT_INBOUND'
  | 'FORECAST_EFFECT_BELOW_ONE_UNIT'
  | 'NO_RECOVERY_EFFECT'
  | 'MISSING_OPERATING_RULE'
  | 'MISSING_REQUIRED_DATA'

export type ResultClass =
  'READY_ORDER_RISK' | 'FORECAST_ONLY_READY' | 'PURE_NO_RISK' | 'WARNING_NO_RISK'

export interface DelayOption {
  id: string
  type: OptionType
  feasibility: Feasibility
  reasonCode: ReasonCode | null
  /** 'YYYY-MM-DD'. 판정할 수 없으면 null */
  expectedArrival: string | null
  securableQuantity: number | null
  /** 지연 때문에 위험해진 주문 중 이 대응안으로 납기를 회복하는 주문 수 */
  recoveredOrders: number | null
  /** 대응 후에도 남는 위험 주문 수 */
  remainingRiskOrders: number | null
  recommended: boolean
  /** AI 설명(`option_explanations`). 설명이 없으면 null */
  explanation: string | null
}

export interface RiskOrderLine {
  lineNo: number
  skuCode: string
  openQuantity: number
}

export interface RiskOrder {
  orderCode: string
  /** 위험으로 판정한 사유(`riskReason`) */
  riskReason: string
  attribution: 'delay_induced' | 'pre_existing'
  /** 'YYYY-MM-DD' */
  promisedDate: string
  /** 'YYYY-MM-DD' */
  expectedDate: string
  lines: RiskOrderLine[]
}

export interface InventoryImpact {
  /** 지연으로 늘어난 부족 수량(지연 반영 부족 − 계획 기준 부족) */
  increasedShortage: number
  /** 'YYYY-MM-DD'. 안전재고 아래로 내려가는 날 */
  safetyStockBreachDate: string | null
  /** 'YYYY-MM-DD'. 재고가 바닥나는 날 */
  stockoutDate: string | null
  /** 'YYYY-MM-DD'. 품절 상태가 끝나는 날 */
  stockoutEndDate: string | null
  stockoutDays: number | null
}

export interface AiExplanation {
  runSummary: string
  riskSummary: string
  recommendation: string
  warnings: string[]
}

export interface DelayAnalysis {
  /** 위험 없음(`NO_RISK`)이면 `PURE_NO_RISK`·`WARNING_NO_RISK`이고, 위험 주문·대응안·설명이 비어 있다. */
  resultClass: ResultClass
  impact: InventoryImpact
  /** `FORECAST_ONLY_READY`일 때 지연 증분 예측 부족 SKU 수 */
  forecastOnlySkuCount: number
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
  /** ISO 8601 UTC. 사용한 수집 중 가장 오래된 시각. 입력이 확정되기 전에는 null */
  baseDataAt: string | null
  /** 입력 확정 때 마지막 수집이 실패·지연이던 원천 안내 */
  dataNotice: string | null
  /** 분석이 진행 중이면 현재 단계 이름 */
  progressStep: string | null
  /** 분석 보류·실패 사유 */
  failureMessage: string | null
  /** 자료 변경으로 재분석이 필요할 때 사유 */
  staleReason: string | null
  /** 결과가 없으면(분석 중·보류·실패·지연 해소) null */
  analysis: DelayAnalysis | null
  opinions: MemberOpinion[]
  finalDecision: FinalDecision | null
}

export const DELAY_STATUS_LABEL: Record<DelayStatus, string> = {
  ready: '선택 대기',
  analyzing: '분석 중',
  on_hold: '분석 보류',
  needs_reanalysis: '재분석 필요',
  finalized: '선택 완료',
  no_risk: '위험 없음',
  no_delay: '지연 해소',
}

export const DELAY_STATUS_BADGE_VARIANT = {
  ready: 'warning',
  analyzing: 'info',
  on_hold: 'danger',
  needs_reanalysis: 'neutral',
  finalized: 'success',
  no_risk: 'success',
  no_delay: 'neutral',
} as const satisfies Record<DelayStatus, 'warning' | 'info' | 'danger' | 'neutral' | 'success'>

export const DELAY_STATUS_OPTIONS = Object.keys(DELAY_STATUS_LABEL) as DelayStatus[]

export const STAGE_LABEL: Record<StageCode, string> = {
  PRE_DEPARTURE: '출항 전',
  AT_SEA: '해상 운송',
  IN_AIR: '항공 운송',
  AT_PORT: '항구 도착·통관 중',
  RECEIVED: '입고 완료',
}

/** 한국 출발 항구. 인천은 항공, 부산은 해상 선적이 출발한다. */
const ORIGIN_PORT_LABEL: Record<TransportMode, string> = {
  AIR: '인천',
  OCEAN: '부산',
}

/** 경로의 출발 'KR'을 운송 수단에 맞는 출발 항구로 바꿔 보여 준다. 예: '부산 → LOS ANGELES' */
export const formatRoute = ({ route, transportMode }: Pick<DelayCase, 'route' | 'transportMode'>) =>
  route.replace(/^KR/, ORIGIN_PORT_LABEL[transportMode])

// 표시명은 API 명세 2절 라벨 사전(labels/ko-v1)을 그대로 쓴다.
export const OPTION_TYPE_LABEL: Record<OptionType, string> = {
  KEEP_PLAN: '현재 계획 유지',
  PRE_DEPARTURE_AIR: '출항 전 항공 전환',
  KR_AIR_REPLENISH: '한국 창고 항공 보충',
  OTHER_REGION_FULFILL: '다른 권역 창고 출고',
}

export const FEASIBILITY_LABEL: Record<Feasibility, string> = {
  FEASIBLE: '실행 가능',
  NOT_FEASIBLE: '실행 불가',
  NEEDS_CHECK: '확인 필요',
}

export const FEASIBILITY_BADGE_VARIANT = {
  FEASIBLE: 'success',
  NOT_FEASIBLE: 'danger',
  NEEDS_CHECK: 'warning',
} as const satisfies Record<Feasibility, 'success' | 'danger' | 'warning'>

/** 역할별로 고를 수 있는 대응안. 최종 선택은 실행 가능한 안만, 초안은 확인 필요인 안까지 고른다. */
const SELECTABLE_FEASIBILITY: Record<ClientRole, Feasibility[]> = {
  lead: ['FEASIBLE'],
  member: ['FEASIBLE', 'NEEDS_CHECK'],
}

export const getSelectableOptions = (role: ClientRole, options: DelayOption[]) =>
  options.filter((option) => SELECTABLE_FEASIBILITY[role].includes(option.feasibility))

export const REASON_LABEL: Record<ReasonCode, string> = {
  ARRIVES_AFTER_DELAYED_SHIPMENT: '지연 선적보다 늦게 도착',
  NO_KR_ELIGIBLE_STOCK: '한국 창고에 보충할 재고 없음',
  NO_TRANSFERABLE_STOCK: '공여 창고에 넘길 재고 없음',
  PROMISE_UNREACHABLE_LEADTIME: '배송 기간 안에 약속일을 맞출 수 없음',
  DONOR_NO_NEXT_INBOUND: '공여 창고의 다음 입고 없음',
  FORECAST_EFFECT_BELOW_ONE_UNIT: '효과가 1개 미만',
  NO_RECOVERY_EFFECT: '회복 효과 없음',
  MISSING_OPERATING_RULE: '운영 기준 없음',
  MISSING_REQUIRED_DATA: '필수 자료 없음',
}

export const ATTRIBUTION_LABEL = {
  delay_induced: '지연 유발',
  pre_existing: '기존 위험',
} as const satisfies Record<RiskOrder['attribution'], string>

/** 선택 대기를 위로, 같은 상태끼리는 지연 일수가 큰 순서로 정렬한다. */
export const sortDelayCases = (cases: DelayCase[]) =>
  [...cases].sort((a, b) => {
    const readyDiff = Number(b.status === 'ready') - Number(a.status === 'ready')
    return readyDiff || b.delayDays - a.delayDays
  })

export const countByStatus = (cases: DelayCase[]): Record<DelayStatusFilter, number> => {
  const counts: Record<DelayStatusFilter, number> = {
    all: cases.length,
    ready: 0,
    analyzing: 0,
    on_hold: 0,
    needs_reanalysis: 0,
    finalized: 0,
    no_risk: 0,
    no_delay: 0,
  }
  for (const delayCase of cases) {
    counts[delayCase.status] += 1
  }
  return counts
}

export const filterDelayCases = (
  cases: DelayCase[],
  status: DelayStatusFilter,
  keyword: string,
) => {
  const query = keyword.trim().toLowerCase()
  return cases.filter(
    (delayCase) =>
      (status === 'all' || delayCase.status === status) &&
      (!query ||
        delayCase.shipmentCode.toLowerCase().includes(query) ||
        delayCase.productName?.toLowerCase().includes(query)),
  )
}

/** 대표 상품명. 상품이 여러 개면 '외 N개'를 붙인다. */
export const formatProductLabel = ({ productName, skuCount }: DelayCase) => {
  if (!productName) {
    return EMPTY_TEXT.PRODUCT
  }
  return skuCount > 1 ? `${productName} ${formatExtraSkus(skuCount)}` : productName
}

/** 대표 상품 외에 담긴 상품 수. 하나뿐이면 빈 문자열. */
export const formatExtraSkus = (skuCount: number) => (skuCount > 1 ? `외 ${skuCount - 1}개` : '')

/** 'YYYY-MM-DD'를 'MM.DD'로 줄여 보여 준다. */
export const formatMonthDay = (date: string) => date.slice(5).replace('-', '.')

/** 최종 선택이 가능한 상태인지. 선택 대기이고, 설명이 있어야 한다. */
export const canDecide = (delayCase: DelayCase) =>
  delayCase.status === 'ready' && delayCase.analysis?.explanation != null

/** 상태별 재분석 요청 가능 여부. 분석 중이거나 선택이 끝났으면 요청할 수 없다. 상태를 추가하면 여기도 적어야 컴파일된다. */
const CAN_REANALYZE: Record<DelayStatus, boolean> = {
  ready: true,
  analyzing: false,
  on_hold: true,
  needs_reanalysis: true,
  finalized: false,
  no_risk: true,
  no_delay: false,
}

export const canReanalyze = (delayCase: DelayCase) => CAN_REANALYZE[delayCase.status]

// 표시명은 API 명세 2절 라벨 사전(labels/ko-v1)과 상태별 고정 문구를 그대로 쓴다.
export const RESULT_CLASS_LABEL: Record<ResultClass, string> = {
  READY_ORDER_RISK: '실주문 납기 위험',
  FORECAST_ONLY_READY: '예측 기준 부족 위험',
  PURE_NO_RISK: '지연 영향 없음',
  WARNING_NO_RISK: '지연 영향 없음(기존 부족 있음)',
}

export const NO_RISK_MESSAGE: Record<'PURE_NO_RISK' | 'WARNING_NO_RISK', string> = {
  PURE_NO_RISK: '지연으로 늘어나는 부족이 없습니다.',
  WARNING_NO_RISK: '지연으로 늘어나는 부족은 없지만, 계획 기준으로 이미 부족한 SKU가 있습니다.',
}

/** 계획 유지는 항상 가능한 기준선이라, 그 밖에 실행 가능한 대응안이 하나도 없는지 본다. */
export const hasNoFeasibleOption = (options: DelayOption[]) =>
  !options.some((option) => option.type !== 'KEEP_PLAN' && option.feasibility === 'FEASIBLE')

const MISSING_DATA_REASONS: ReasonCode[] = ['MISSING_OPERATING_RULE', 'MISSING_REQUIRED_DATA']

/** 운영 기준·필수 자료가 없어 판정하지 못한(`확인 필요`) 대응안 */
export const getOptionsMissingData = (options: DelayOption[]) =>
  options.filter((option) => option.reasonCode && MISSING_DATA_REASONS.includes(option.reasonCode))
