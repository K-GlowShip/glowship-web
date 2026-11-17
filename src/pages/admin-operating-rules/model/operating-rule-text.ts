import { LEAD_TIME_TYPE, type LeadTime, type LeadTimeType } from '@/shared/api'

export const LEAD_TIME_TYPE_LABEL: Record<LeadTimeType, string> = {
  [LEAD_TIME_TYPE.CUSTOMER_DELIVERY]: '고객 배송',
  [LEAD_TIME_TYPE.AIR_TRANSIT]: '항공 운송',
  [LEAD_TIME_TYPE.INBOUND_HANDLING]: '입고 처리',
  [LEAD_TIME_TYPE.OUTBOUND_HANDLING]: '출고 처리',
}

const REGION_LABEL: Record<string, string> = { KR: '한국', WEST: '서부', EAST: '동부' }

/** 서버가 새 코드를 추가해도 화면이 깨지지 않게, 라벨이 없으면 코드를 그대로 보여 준다 */
const getRegionLabel = (regionCode: string) => REGION_LABEL[regionCode] ?? regionCode

/** 리드타임이 가리키는 구간. 예: "WH-KR → 동부", 도착 권역이 없으면 "WH-KR" */
export const getLeadTimeRoute = ({ warehouse, toRegionCode }: LeadTime) =>
  toRegionCode
    ? `${warehouse.warehouseCode} → ${getRegionLabel(toRegionCode)}`
    : warehouse.warehouseCode

/** 리드타임 한 줄의 이름. 예: "항공 운송 WH-KR → 동부" */
export const getLeadTimeName = (leadTime: LeadTime) =>
  `${LEAD_TIME_TYPE_LABEL[leadTime.leadTimeType] ?? leadTime.leadTimeType} ${getLeadTimeRoute(leadTime)}`

export const PARTIAL_POLICY = {
  ALLOWED: 'ALLOWED',
  NOT_ALLOWED: 'NOT_ALLOWED',
  UNDECIDED: 'UNDECIDED',
} as const

export type PartialPolicy = (typeof PARTIAL_POLICY)[keyof typeof PARTIAL_POLICY]

export const PARTIAL_POLICY_LABEL: Record<PartialPolicy, string> = {
  [PARTIAL_POLICY.ALLOWED]: '허용',
  [PARTIAL_POLICY.NOT_ALLOWED]: '불가',
  [PARTIAL_POLICY.UNDECIDED]: '미정',
}

/** 서버 값(`true`·`false`·`null`)을 화면의 부분 출고 선택으로 바꾼다 */
export const toPartialPolicy = (allowed: boolean | null): PartialPolicy => {
  if (allowed === null) {
    return PARTIAL_POLICY.UNDECIDED
  }
  return allowed ? PARTIAL_POLICY.ALLOWED : PARTIAL_POLICY.NOT_ALLOWED
}

export const fromPartialPolicy = (policy: PartialPolicy): boolean | null => {
  if (policy === PARTIAL_POLICY.UNDECIDED) {
    return null
  }
  return policy === PARTIAL_POLICY.ALLOWED
}

/** 분석 계산이 지원하는 판매 기준 일수. 다른 값을 저장하면 분석이 보류(`ON_HOLD`)되어 고정한다(명세 4.2) */
export const SUPPORTED_SALES_BASIS_DAYS = 28

export const OPERATING_RULE_ERROR = {
  EFFECTIVE_DATE_REQUIRED: '적용 시작일을 입력해주세요.',
  SAFETY_STOCK_DAYS_INVALID: '안전재고 일수는 1 이상의 정수로 입력해주세요.',
  LEAD_TIME_DAYS_INVALID: '일수는 0 이상의 정수로 입력해주세요.',
} as const
