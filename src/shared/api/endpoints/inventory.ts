import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import type { SkuSummary, WarehouseSummary } from '../summary'

export interface InventoryItem {
  /** `YYYY-MM-DD` */
  inventoryDate: string
  warehouse: WarehouseSummary
  sku: SkuSummary
  /** 보유 = 예약 + 가용 */
  onHandQuantity: number
  reservedQuantity: number
  availableQuantity: number
  /** 당일 출고 수량 */
  outboundQuantity: number
  dataSyncRunId: string
}

export interface InventoryPage extends Page<InventoryItem> {
  /** 기준 일자 `YYYY-MM-DD`. 재고가 없으면 null */
  inventoryDate: string | null
}

export interface GetInventoryParams extends PageParams {
  /** SKU 코드·상품명 부분 일치. 최대 100자 */
  q?: string
}

/** 한 일자의 창고·상품별 재고. 일자를 생략하면 고객사의 최신 적재 일자다. */
export const getInventory = (params?: GetInventoryParams, config?: AxiosRequestConfig) =>
  API.get<InventoryPage>(ENDPOINT.INVENTORY, { ...config, params })
