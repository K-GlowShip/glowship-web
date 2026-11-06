import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import type { SkuSummary, WarehouseSummary } from '../summary'

export const TRANSPORT_MODE = {
  OCEAN: 'OCEAN',
  AIR: 'AIR',
} as const

export type TransportMode = (typeof TRANSPORT_MODE)[keyof typeof TRANSPORT_MODE]

export const SHIPMENT_STAGE = {
  PRE_DEPARTURE: 'PRE_DEPARTURE',
  AT_SEA: 'AT_SEA',
  IN_AIR: 'IN_AIR',
  AT_PORT: 'AT_PORT',
  RECEIVED: 'RECEIVED',
} as const

export type ShipmentStage = (typeof SHIPMENT_STAGE)[keyof typeof SHIPMENT_STAGE]

export interface Shipment {
  shipmentId: string
  shipmentCode: string
  transportMode: TransportMode
  /** 예: "KR → LOS ANGELES" */
  route: string
  warehouse: WarehouseSummary
  /** 선적 상세가 없으면 null */
  representativeSku: SkuSummary | null
  skuCount: number
  stage: ShipmentStage
  /** 날짜는 모두 `YYYY-MM-DD` */
  plannedKrReleaseDate: string
  planned3plInboundDate: string
  expected3plInboundDate: string
  /** 입고 전이면 null */
  actual3plInboundDate: string | null
  /** 입고 전에는 예상 입고일, 입고 완료면 실제 입고일이 계획 입고일보다 늦은지 */
  isDelayed: boolean
  delayDays: number
}

export interface GetShipmentsParams extends PageParams {
  /** 선적 코드 부분 일치. 최대 100자 */
  q?: string
}

export const getShipments = (params?: GetShipmentsParams, config?: AxiosRequestConfig) =>
  API.get<Page<Shipment>>(ENDPOINT.SHIPMENTS, { ...config, params })
