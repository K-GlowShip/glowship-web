import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import { ENDPOINT } from '../paths'

export const SYNC_SOURCE_DOMAIN = {
  ORDER: 'ORDER',
  INVENTORY: 'INVENTORY',
  SHIPMENT: 'SHIPMENT',
  PRODUCT: 'PRODUCT',
  WAREHOUSE: 'WAREHOUSE',
} as const

export type SyncSourceDomain = (typeof SYNC_SOURCE_DOMAIN)[keyof typeof SYNC_SOURCE_DOMAIN]

export const SYNC_STATUS = {
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
  FAILED: 'FAILED',
} as const

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS]

/** 원천 유형별 마지막 수집 실행. 수집 이력이 없으면 실행 관련 값은 `null` */
export interface LatestSyncRun {
  dataSyncRunId: string | null
  sourceDomain: SyncSourceDomain
  connectionMethod: 'API' | 'FILE' | null
  status: SyncStatus | null
  /** ISO 8601 UTC */
  startedAt: string | null
  finishedAt: string | null
  receivedCount: number | null
  loadedCount: number | null
  rejectedCount: number | null
  /** 이 원천의 모든 실행에 걸린 미해결 검증 오류 수 */
  openIssueCount: number
  sourceSystemName: string
  syncIntervalMinutes: number
  /** 서버 판정. 마지막 수집이 반영됐고 수집이 멈추지 않았으면 true */
  isSynced: boolean
  /** 마지막으로 끝난 수집의 완료 시각. ISO 8601 UTC */
  lastSyncedAt: string | null
}

/** 원천 유형별 마지막 수집 상태를 조회한다. 고객사 사용자 전용이다. */
export const getLatestDataSyncRuns = (config?: AxiosRequestConfig) =>
  API.get<{ items: LatestSyncRun[] }>(ENDPOINT.DATA_SYNC_RUNS.LATEST, config)

/** 수동 동기화가 시작한 원천 하나의 수집 실행. 적용은 응답 뒤 서버가 이어서 하므로 처음 상태는 `RUNNING`이다 */
export interface StartedSyncRun {
  sourceDomain: SyncSourceDomain
  dataSyncRunId: string
  status: SyncStatus
}

/**
 * 수동 동기화를 시작한다. 본문 없이 보내면 한 번에 다섯 원천을 함께 수집한다(명세 4.3, D16).
 * 응답은 202이고 결과는 `getLatestDataSyncRuns`를 다시 조회해서 본다.
 * 고객사에 실행 중인 수집이 있으면 `409 SYNC_IN_PROGRESS`이고 아무것도 시작하지 않는다.
 */
export const startDataSyncRun = () => API.post<StartedSyncRun[]>(ENDPOINT.DATA_SYNC_RUNS.ROOT)
