import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import type { SkuSummary, WarehouseSummary } from '../summary'

export const INVENTORY_STATUS = {
  OK: 'OK',
  CAUTION: 'CAUTION',
  RISK: 'RISK',
} as const

export type InventoryStatus = (typeof INVENTORY_STATUS)[keyof typeof INVENTORY_STATUS]

/** 거점·상품별 재고 현황(참고값). 입고 예정과 지연은 반영하지 않는다. */
export interface InventoryStatusItem {
  warehouse: WarehouseSummary
  sku: SkuSummary
  availableQuantity: number
  /** 최근 `salesBasisDays`일 평균 일 판매량 */
  averageDailySales: number
  /** `YYYY-MM-DD`. 하루 판매량이 0이면 null */
  safetyStockBreachDate: string | null
  stockoutDate: string | null
  status: InventoryStatus
}

/**
 * 계산 기준 필드(`inventoryDate`·`operatingRuleVersionNo`·`salesBasisDays`·`safetyStockDays`)는
 * 적재된 재고나 적용할 운영 기준이 없으면 `null`이고 `items`는 빈 목록이다.
 */
export interface InventoryStatusPage extends Page<InventoryStatusItem> {
  /** 마지막 재고 일자 `YYYY-MM-DD`. 계산 기준일은 이 날짜 + 1일이다 */
  inventoryDate: string | null
  operatingRuleVersionNo: number | null
  /** 평균 일 판매량을 구하는 기간(일) */
  salesBasisDays: number | null
  safetyStockDays: number | null
  salesBasisType: string
}

export const getInventoryStatus = (params?: PageParams, config?: AxiosRequestConfig) =>
  API.get<InventoryStatusPage>(ENDPOINT.INVENTORY_STATUS, { ...config, params })
