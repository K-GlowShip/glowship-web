import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import { ENDPOINT } from '../paths'
import type { WarehouseSummary } from '../summary'

export const LEAD_TIME_TYPE = {
  CUSTOMER_DELIVERY: 'CUSTOMER_DELIVERY',
  AIR_TRANSIT: 'AIR_TRANSIT',
  INBOUND_HANDLING: 'INBOUND_HANDLING',
  OUTBOUND_HANDLING: 'OUTBOUND_HANDLING',
} as const

export type LeadTimeType = (typeof LEAD_TIME_TYPE)[keyof typeof LEAD_TIME_TYPE]

export const DAY_BASIS = {
  CALENDAR_DAY: 'CALENDAR_DAY',
  BUSINESS_DAY: 'BUSINESS_DAY',
} as const

export type DayBasis = (typeof DAY_BASIS)[keyof typeof DAY_BASIS]

/** 버전을 만든 사람. 다른 관리자가 만든 버전은 요청자에게 보이지 않아 이름·역할이 null이다 */
export interface RuleSetAuthor {
  userId: string
  displayName: string | null
  roleCode: string | null
}

export interface LeadTime {
  leadTimeType: LeadTimeType
  warehouse: WarehouseSummary
  /** 고객 배송·항공 운송에서만 값이 있고 나머지 유형은 null */
  toRegionCode: string | null
  days: number
  dayBasis: DayBasis
}

export interface OperatingRuleSet {
  operatingRuleSetId: string
  versionNo: number
  /** 적용 시작일(YYYY-MM-DD) */
  effectiveDate: string
  safetyStockDays: number
  salesBasisDays: number
  /** null = 정책 미정 */
  isPartialFulfillmentAllowed: boolean | null
  createdAt: string
  author: RuleSetAuthor
  /** 지금 적용 중인 버전. 모든 버전의 적용 시작일이 미래면 모두 false */
  isCurrent: boolean
  leadTimes: LeadTime[]
}

export interface OperatingRuleSetList {
  items: OperatingRuleSet[]
}

/** 운영 기준 버전 목록(`GET /admin/operating-rule-sets`, 명세 4.2). 버전 내림차순이고 페이지가 없다. 관리자(`ADMIN`)만 호출할 수 있다. */
export const getOperatingRuleSets = (companyId: string, config?: AxiosRequestConfig) =>
  API.get<OperatingRuleSetList>(ENDPOINT.ADMIN.OPERATING_RULE_SETS, {
    ...config,
    params: { companyId },
  })

export interface CreateLeadTimeRequest {
  leadTimeType: LeadTimeType
  warehouseId: string
  /** 고객 배송·항공 운송일 때만 보낸다 */
  toRegionCode?: string
  days: number
  dayBasis: DayBasis
}

export interface CreateOperatingRuleSetRequest {
  companyId: string
  effectiveDate: string
  safetyStockDays: number
  salesBasisDays: number
  /** 생략·null = 정책 미정 */
  isPartialFulfillmentAllowed: boolean | null
  leadTimes: CreateLeadTimeRequest[]
}

export interface CreatedOperatingRuleSet {
  operatingRuleSetId: string
  versionNo: number
}

/**
 * 운영 기준 새 버전 저장(`POST /admin/operating-rule-sets`, 명세 4.2, 201). 기존 버전은 고치지 않고 항상 새 버전이다.
 * 이미 적용되는 버전을 저장하면 서버가 그 고객사의 선택 대기 중인 분석을 재분석 필요(`STALE`)로 바꾼다.
 */
export const createOperatingRuleSet = (body: CreateOperatingRuleSetRequest) =>
  API.post<CreatedOperatingRuleSet, CreateOperatingRuleSetRequest>(
    ENDPOINT.ADMIN.OPERATING_RULE_SETS,
    body,
  )
