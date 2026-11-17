import {
  type CreateOperatingRuleSetRequest,
  DAY_BASIS,
  type LeadTime,
  type OperatingRuleSet,
} from '@/shared/api'

import {
  fromPartialPolicy,
  OPERATING_RULE_ERROR,
  type PartialPolicy,
  SUPPORTED_SALES_BASIS_DAYS,
  toPartialPolicy,
} from './operating-rule-text'

export interface RuleSetFormValues {
  effectiveDate: string
  safetyStockDays: string
  isPartialFulfillmentAllowed: PartialPolicy
  /** 기준 버전의 리드타임과 같은 순서의 일수 */
  leadTimeDays: string[]
}

export interface RuleSetFormErrors {
  effectiveDate?: string
  safetyStockDays?: string
  /** 기준 버전의 리드타임과 같은 순서. 오류가 없는 칸은 `undefined` */
  leadTimeDays?: (string | undefined)[]
}

/**
 * 새 버전 폼의 처음 값. 기준 버전(지금 적용 중인 버전, 없으면 가장 최근 버전)의 값을 채운다.
 * 적용 시작일은 비워 둔다: 오늘 이전·오늘로 저장하면 선택 대기 중인 분석이 재분석 필요가 되므로 직접 고르게 한다.
 */
export const toInitialFormValues = (base: OperatingRuleSet | undefined): RuleSetFormValues => ({
  effectiveDate: '',
  safetyStockDays: base ? String(base.safetyStockDays) : '',
  isPartialFulfillmentAllowed: toPartialPolicy(base?.isPartialFulfillmentAllowed ?? null),
  leadTimeDays: base ? base.leadTimes.map(({ days }) => String(days)) : [],
})

const isInteger = (value: string, min: number) => /^\d+$/.test(value) && Number(value) >= min

export function validateRuleSetForm({
  effectiveDate,
  safetyStockDays,
  leadTimeDays,
}: RuleSetFormValues): RuleSetFormErrors {
  const errors: RuleSetFormErrors = {}

  if (!effectiveDate) {
    errors.effectiveDate = OPERATING_RULE_ERROR.EFFECTIVE_DATE_REQUIRED
  }
  if (!isInteger(safetyStockDays.trim(), 1)) {
    errors.safetyStockDays = OPERATING_RULE_ERROR.SAFETY_STOCK_DAYS_INVALID
  }

  const leadTimeErrors = leadTimeDays.map((days) =>
    isInteger(days.trim(), 0) ? undefined : OPERATING_RULE_ERROR.LEAD_TIME_DAYS_INVALID,
  )
  if (leadTimeErrors.some(Boolean)) {
    errors.leadTimeDays = leadTimeErrors
  }

  return errors
}

/**
 * 폼 값을 저장 요청으로 바꾼다. 리드타임의 유형·창고·도착 권역은 기준 버전 그대로 두고 일수만 바꾼다
 * (창고 목록 API가 없고, 조합이 어긋나는 `INVALID_LEAD_TIME`을 피하려는 것이다).
 * 일수 기준은 분석이 지원하는 달력일로 고정한다.
 */
export const toCreateRequest = (
  companyId: string,
  values: RuleSetFormValues,
  baseLeadTimes: LeadTime[],
): CreateOperatingRuleSetRequest => ({
  companyId,
  effectiveDate: values.effectiveDate,
  safetyStockDays: Number(values.safetyStockDays.trim()),
  salesBasisDays: SUPPORTED_SALES_BASIS_DAYS,
  isPartialFulfillmentAllowed: fromPartialPolicy(values.isPartialFulfillmentAllowed),
  leadTimes: baseLeadTimes.map(({ leadTimeType, warehouse, toRegionCode }, index) => ({
    leadTimeType,
    warehouseId: warehouse.warehouseId,
    ...(toRegionCode ? { toRegionCode } : {}),
    days: Number(values.leadTimeDays[index].trim()),
    dayBasis: DAY_BASIS.CALENDAR_DAY,
  })),
})

/** 새 버전의 기준으로 삼을 버전: 지금 적용 중인 버전, 없으면(모두 미래 적용) 가장 최근 버전. 목록은 버전 내림차순이다 */
export const pickBaseVersion = (items: OperatingRuleSet[] | undefined) =>
  items?.find((item) => item.isCurrent) ?? items?.[0]
