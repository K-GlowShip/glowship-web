import { type LatestSyncRun, SYNC_SOURCE_DOMAIN, SYNC_STATUS } from '@/shared/api'

/** 수집 현황을 보여 주는 원천. 상품·창고는 카드가 없다. */
export const SYNC_CARD_DOMAINS = [
  SYNC_SOURCE_DOMAIN.ORDER,
  SYNC_SOURCE_DOMAIN.INVENTORY,
  SYNC_SOURCE_DOMAIN.SHIPMENT,
] as const

export const SYNC_CARD_NAME: Record<(typeof SYNC_CARD_DOMAINS)[number], string> = {
  [SYNC_SOURCE_DOMAIN.ORDER]: '주문 데이터',
  [SYNC_SOURCE_DOMAIN.INVENTORY]: '재고 데이터',
  [SYNC_SOURCE_DOMAIN.SHIPMENT]: '선적 데이터',
}

interface SyncBadge {
  label: string
  variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
}

/**
 * 수집 상태 배지. 서버가 판정한 `isSynced`와 마지막 실행의 `status`로 정한다.
 * - 수집 중이면 판정을 미루고 "수집 중"
 * - 동기화되지 않았으면, 마지막 수집 기록이 있으면 "수집 오류"(실패 또는 수집 멈춤), 없으면 "미연동"
 * - 동기화됐으면 일부 레코드가 거절됐을 때만 "일부 오류"
 */
export const getSyncBadge = ({ status, isSynced, lastSyncedAt }: LatestSyncRun): SyncBadge => {
  if (status === SYNC_STATUS.RUNNING) {
    return { label: '수집 중', variant: 'info' }
  }
  if (!isSynced) {
    return lastSyncedAt
      ? { label: '수집 오류', variant: 'danger' }
      : { label: '미연동', variant: 'neutral' }
  }
  if (status === SYNC_STATUS.PARTIAL_SUCCESS) {
    return { label: '일부 오류', variant: 'warning' }
  }
  return { label: '정상', variant: 'success' }
}

export const isSyncError = ({ status, isSynced, lastSyncedAt }: LatestSyncRun) =>
  status !== SYNC_STATUS.RUNNING && !isSynced && lastSyncedAt !== null
