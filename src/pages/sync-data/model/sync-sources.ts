export type SyncStatus = 'normal' | 'error'

export interface SyncSource {
  id: string
  name: string
  system: string
  status: SyncStatus
  lastCollectedAt: string
  interval: string
}

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
    lastCollectedAt: '10.21 09:30 KST',
    interval: '10분마다 자동 수집',
  },
  {
    id: 'inventory',
    name: '재고 데이터',
    system: 'WMS · LA / NJ',
    status: 'normal',
    lastCollectedAt: '10.21 09:30 KST',
    interval: '10분마다 자동 수집',
  },
  {
    id: 'shipment',
    name: '선적 데이터',
    system: 'TMS',
    status: 'error',
    lastCollectedAt: '10.21 09:10 KST',
    interval: '10분마다 자동 수집',
  },
]
