export type SyncStatus = 'normal' | 'error'

export interface SyncSource {
  id: string
  name: string
  system: string
  status: SyncStatus
  /** ISO 8601 UTC. 예: '2026-10-21T00:30:00Z' */
  lastCollectedAt: string
}

export const SYNC_INTERVAL_LABEL = '모든 데이터는 10분마다 자동으로 수집됩니다'

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  normal: '정상',
  error: '수집 오류',
}

// TODO: 연동 데이터 API 명세 확정 후 서버 응답으로 교체
export const SYNC_SOURCES: SyncSource[] = [
  {
    id: 'order',
    name: '주문 데이터',
    system: 'SAP ERP',
    status: 'normal',
    lastCollectedAt: '2026-10-21T00:30:00Z',
  },
  {
    id: 'inventory',
    name: '재고 데이터',
    system: 'WMS · LA / NJ',
    status: 'normal',
    lastCollectedAt: '2026-10-21T00:30:00Z',
  },
  {
    id: 'shipment',
    name: '선적 데이터',
    system: 'TMS',
    status: 'error',
    lastCollectedAt: '2026-10-21T00:10:00Z',
  },
]
