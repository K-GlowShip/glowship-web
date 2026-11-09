import { type LatestSyncRun, SYNC_STATUS } from '@/shared/api'

/** 원천 하나의 수집 상태 단계. 카드처럼 여러 원천을 묶을 때 나쁜 쪽을 고르는 기준이다. */
export const SYNC_LEVEL = {
  RUNNING: 'RUNNING',
  ERROR: 'ERROR',
  NOT_CONNECTED: 'NOT_CONNECTED',
  PARTIAL: 'PARTIAL',
  OK: 'OK',
} as const

export type SyncLevel = (typeof SYNC_LEVEL)[keyof typeof SYNC_LEVEL]

/** 숫자가 클수록 나쁘다. 수집 중 > 수집 오류 > 미연동 > 일부 오류 > 정상 (명세 4.3절) */
export const SYNC_LEVEL_SEVERITY: Record<SyncLevel, number> = {
  [SYNC_LEVEL.RUNNING]: 4,
  [SYNC_LEVEL.ERROR]: 3,
  [SYNC_LEVEL.NOT_CONNECTED]: 2,
  [SYNC_LEVEL.PARTIAL]: 1,
  [SYNC_LEVEL.OK]: 0,
}

interface SyncBadge {
  label: string
  variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
}

export const SYNC_LEVEL_BADGE: Record<SyncLevel, SyncBadge> = {
  [SYNC_LEVEL.RUNNING]: { label: '수집 중', variant: 'info' },
  [SYNC_LEVEL.ERROR]: { label: '수집 오류', variant: 'danger' },
  [SYNC_LEVEL.NOT_CONNECTED]: { label: '미연동', variant: 'neutral' },
  [SYNC_LEVEL.PARTIAL]: { label: '일부 오류', variant: 'warning' },
  [SYNC_LEVEL.OK]: { label: '정상', variant: 'success' },
}

/**
 * 원천 하나의 수집 상태 단계. 서버가 판정한 `isSynced`와 마지막 실행의 `status`로 정한다.
 * - 수집 중이면 판정을 미루고 "수집 중"
 * - 동기화되지 않았으면, 마지막 수집 기록이 있으면 "수집 오류"(실패 또는 수집 멈춤), 없으면 "미연동"
 * - 동기화됐으면 일부 레코드가 거절됐을 때만 "일부 오류"
 */
export const getSyncLevel = ({ status, isSynced, lastSyncedAt }: LatestSyncRun): SyncLevel => {
  if (status === SYNC_STATUS.RUNNING) {
    return SYNC_LEVEL.RUNNING
  }
  if (!isSynced) {
    return lastSyncedAt ? SYNC_LEVEL.ERROR : SYNC_LEVEL.NOT_CONNECTED
  }
  return status === SYNC_STATUS.PARTIAL_SUCCESS ? SYNC_LEVEL.PARTIAL : SYNC_LEVEL.OK
}

export const getSyncBadge = (run: LatestSyncRun): SyncBadge => SYNC_LEVEL_BADGE[getSyncLevel(run)]

export const isSyncError = (run: LatestSyncRun) => getSyncLevel(run) === SYNC_LEVEL.ERROR
