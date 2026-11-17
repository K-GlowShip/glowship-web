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

/** 선적 상세의 줄 하나. 줄 번호 순 */
export interface ShipmentLine {
  lineNo: number
  sku: SkuSummary
  shippedQuantity: number
}

/** 계획 3PL 입고일을 정한 시장 리드타임 기준(명세 4.3 `plannedBasis`) */
export interface PlannedBasis {
  /** 기준 달. 예: "2025-07" */
  month: string
  /** 도착 항구 이름. 표의 값 그대로, 예: "LOS ANGELES, CA" */
  usPortName: string
  /** 총 리드타임(일). 소수가 있다 */
  totalLeadtimeP50: number
  totalLeadtimeP90: number
  /** 신뢰도. 원천 값 그대로(예: "low") */
  confidenceLeadtime: string
}

/** 일정 관측 한 번. 오래된 순으로 온다 */
export interface ScheduleObservation {
  /** UTC 시각 */
  observedAt: string
  stage: ShipmentStage
  /** 예상 항구 도착일. 값이 없으면 null */
  expectedPortArrivalDate: string | null
  expected3plInboundDate: string
}

/** 선적 상세(명세 4.3 `GET /shipments/{shipmentId}`). 목록 행의 필드 전부를 포함한다 */
export interface ShipmentDetail extends Shipment {
  /** 현재 예상 항구 도착일. 3PL 입고일과 다른 날짜다(BR-007). 값이 없으면 null */
  expectedPortArrivalDate: string | null
  lines: ShipmentLine[]
  plannedBasis: PlannedBasis
  /** 관측이 없는 선적은 빈 배열 */
  scheduleHistory: ScheduleObservation[]
  /** 이 선적을 마지막으로 바꾼 수집의 종료 시각(UTC). 오래 바뀌지 않은 선적은 마지막 수집보다 이르다 */
  dataBasisAt: string
}

/** 선적 상세. 없거나 다른 고객사의 선적은 404 `SHIPMENT_NOT_FOUND`다. */
export const getShipment = (shipmentId: string, config?: AxiosRequestConfig) =>
  API.get<ShipmentDetail>(`${ENDPOINT.SHIPMENTS}/${encodeURIComponent(shipmentId)}`, config)
