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
  /** 선적 코드, 또는 그 선적에 실린 상품 코드·상품명 부분 일치. 최대 50자(`DELAY_SEARCH_MAX_LENGTH`) */
  q?: string
}

export const getDelayEvents = (params?: GetDelayEventsParams, config?: AxiosRequestConfig) =>
  API.get<DelayEventListPage>(ENDPOINT.DELAY_EVENTS, { ...config, params })

/** 지연 상세의 분석 버전 한 건. 시스템의 분석 기록이며, 사람의 판단 이력(`/decisions`)과 다르다. */
export interface DelayEventRun {
  runId: string
  /** 서버가 아직 값을 만들지 않았으면 null */
  runCode: string | null
  versionNo: number
  status: string
  isLatest: boolean
  triggerType: string
  triggerReason: string | null
  parentRunId: string | null
  /** 완료 판정 당시 상태. 완료 전이면 null */
  completedStatus: string | null
  resultClass: string | null
  /** `ON_HOLD`·`FAILED`일 때만 값이 있다 */
  failureCode: string | null
  /** ISO 8601 UTC. `STALE`이 아니면 null */
  staleDetectedAt: string | null
  stalePrimaryReason: string | null
  /** ISO 8601 UTC */
  startedAt: string | null
  finishedAt: string | null
}

/** 지연 상세. 목록의 한 건과 같은 값에 이전 예상 입고일과 분석 버전 이력(`runs`)이 더해진다. */
export interface DelayEventDetail extends Omit<
  DelayEventListItem,
  'atRiskOrderCount' | 'currentRun' | 'hasFinalDecision'
> {
  /** `YYYY-MM-DD`. 이전에 관측한 예상 입고일. 없으면 null */
  previousExpected3plInboundDate: string | null
  /** 최신 버전 먼저. 실행이 없으면 빈 배열 */
  runs: DelayEventRun[]
}

/** 없는 지연·다른 고객사 지연은 404 `DELAY_EVENT_NOT_FOUND` */
export const getDelayEvent = (delayEventId: string, config?: AxiosRequestConfig) =>
  API.get<DelayEventDetail>(`${ENDPOINT.DELAY_EVENTS}/${encodeURIComponent(delayEventId)}`, config)
