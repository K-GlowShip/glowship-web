import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import type { SkuSummary, WarehouseSummary } from '../summary'

export const ORDER_STATUS = {
  OPEN: 'OPEN',
  PARTIALLY_SHIPPED: 'PARTIALLY_SHIPPED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REMOVED_AT_SOURCE: 'REMOVED_AT_SOURCE',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const SALES_CHANNEL = {
  AMAZON: 'AMAZON',
  SEPHORA: 'SEPHORA',
} as const

export type SalesChannel = (typeof SALES_CHANNEL)[keyof typeof SALES_CHANNEL]

export interface OrderLine {
  lineNo: number
  sku: SkuSummary
  orderedQuantity: number
  shippedQuantity: number
  /** 정상(`ACTIVE`) 또는 원천 삭제 */
  lineStatus: string
}

export interface Order {
  orderId: string
  orderCode: string
  salesChannel: SalesChannel
  /** 고객 권역(`WEST`·`EAST`) */
  customerRegion: string
  warehouse: WarehouseSummary
  /** ISO 8601 UTC */
  orderedAt: string
  promisedDeliveryAt: string
  status: OrderStatus
  /** 아직 계산하지 않아 서버가 항상 null로 준다 */
  securedDate: string | null
  /** 아직 계산하지 않아 서버가 항상 null로 준다 */
  plannedDispatchDate: string | null
  /** `YYYY-MM-DD`. 출고 전이면 null */
  actualDispatchDate: string | null
  /** 아직 계산하지 않아 서버가 항상 null로 준다 */
  expectedDeliveryDate: string | null
  lines: OrderLine[]
}

export interface GetOrdersParams extends PageParams {
  /** 주문 번호·상품 코드·상품명 부분 일치. 최대 100자 */
  q?: string
}

export const getOrders = (params?: GetOrdersParams, config?: AxiosRequestConfig) =>
  API.get<Page<Order>>(ENDPOINT.ORDERS, { ...config, params })
