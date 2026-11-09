import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import type { RunSummary, ShipmentSummary, SkuSummary, WarehouseSummary } from '../summary'

/** 지연 목록의 한 건. 에피소드(선적의 지연 한 번)마다 하나다. */
export interface DelayEventListItem {
  delayEventId: string
  episodeNo: number
  shipment: ShipmentSummary
  /** 도착 창고 */
  warehouse: WarehouseSummary
  /** 선적에서 수량이 가장 많은 상품. 상세가 없으면 null */
  representativeSku: SkuSummary | null
  skuCount: number
  /** 예: `KR → LOS ANGELES` */
  route: string
  transportMode: string
  stage: string
  /** `YYYY-MM-DD` */
  planned3plInboundDate: string
  expected3plInboundDate: string
  delayDays: number
  /** ISO 8601 UTC */
  detectedAt: string
  closedAt: string | null
  closeReason: string | null
  /** 현재 실행에 계산 결과가 없으면 null */
  atRiskOrderCount: number | null
  /** 실행이 없으면 null */
  currentRun: RunSummary | null
  hasFinalDecision: boolean
}

/** 상태 탭별 건수. 탭 필터와 `hasFinalDecision` 필터는 반영하지 않는다. */
export interface DelayEventCounts {
  all: number
  readyForReview: number
  analyzing: number
  onHold: number
  needsReanalysis: number
  finalized: number
  noRisk: number
  noDelay: number
}

export interface DelayEventListPage extends Page<DelayEventListItem> {
  counts: DelayEventCounts
}

export interface GetDelayEventsParams extends PageParams {
  /** `ALL`·`READY_FOR_REVIEW`·`ANALYZING`·`ON_HOLD`·`NEEDS_REANALYSIS`·`FINALIZED`·`NO_RISK`·`NO_DELAY` */
  status?: string
  /** 감지 시각 기준 `[from, to)`. ISO 8601 UTC 시각이고 `to`는 포함하지 않는다 */
  from?: string
  to?: string
  hasFinalDecision?: boolean
  /** 선적 코드, 또는 그 선적에 실린 상품 코드·상품명 부분 일치. 최대 100자 */
  q?: string
}

export const getDelayEvents = (params?: GetDelayEventsParams, config?: AxiosRequestConfig) =>
  API.get<DelayEventListPage>(ENDPOINT.DELAY_EVENTS, { ...config, params })
