/** 명세 v6.2 `GET /data-sync-runs/latest`의 `status` */
export type SyncStatus = 'RUNNING' | 'SUCCEEDED' | 'PARTIAL_SUCCESS' | 'FAILED'

export interface SyncSource {
  id: string
  name: string
  system: string
  status: SyncStatus
  /** ISO 8601 UTC. 예: '2026-10-21T00:30:00Z' */
  lastCollectedAt: string
}

export const SYNC_INTERVAL_LABEL = '모든 데이터는 10분마다 자동으로 수집됩니다'

export const SYNC_STATUS_BADGE_VARIANT = {
  RUNNING: 'info',
  SUCCEEDED: 'success',
  PARTIAL_SUCCESS: 'warning',
  FAILED: 'danger',
} as const satisfies Record<SyncStatus, 'info' | 'success' | 'warning' | 'danger'>

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  RUNNING: '수집 중',
  SUCCEEDED: '정상',
  PARTIAL_SUCCESS: '일부 오류',
  FAILED: '수집 오류',
}

// TODO: 연동 데이터 API 명세 확정 후 서버 응답으로 교체
export const SYNC_SOURCES: SyncSource[] = [
  {
    id: 'order',
    name: '주문 데이터',
    system: 'SAP ERP',
    status: 'SUCCEEDED',
    lastCollectedAt: '2026-10-21T00:30:00Z',
  },
  {
    id: 'inventory',
    name: '재고 데이터',
    system: 'WMS · LA / NJ',
    status: 'SUCCEEDED',
    lastCollectedAt: '2026-10-21T00:30:00Z',
  },
  {
    id: 'shipment',
    name: '선적 데이터',
    system: 'TMS',
    status: 'FAILED',
    lastCollectedAt: '2026-10-21T00:10:00Z',
  },
]
