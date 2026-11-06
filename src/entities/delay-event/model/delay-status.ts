/** 서버 `GET /delay-events`의 `status` 코드값(API 명세 v6.2 2절, 4.4 탭 표) */
export const DELAY_STATUS = {
  READY: 'READY_FOR_REVIEW',
  ANALYZING: 'ANALYZING',
  ON_HOLD: 'ON_HOLD',
  NEEDS_REANALYSIS: 'NEEDS_REANALYSIS',
  FINALIZED: 'FINALIZED',
  NO_RISK: 'NO_RISK',
  NO_DELAY: 'NO_DELAY',
} as const

export type DelayStatus = (typeof DELAY_STATUS)[keyof typeof DELAY_STATUS]

/** 명세 2절 "코드값 → 화면 표시명". 화면마다 같은 코드를 다른 이름으로 부르지 않도록 여기서만 정의한다. */
export const DELAY_STATUS_LABEL: Record<DelayStatus, string> = {
  [DELAY_STATUS.READY]: '선택 대기',
  [DELAY_STATUS.ANALYZING]: '분석 중',
  [DELAY_STATUS.ON_HOLD]: '분석 보류',
  [DELAY_STATUS.NEEDS_REANALYSIS]: '재분석 필요',
  [DELAY_STATUS.FINALIZED]: '선택 완료',
  [DELAY_STATUS.NO_RISK]: '위험 없음',
  [DELAY_STATUS.NO_DELAY]: '지연 해소',
}

export const DELAY_STATUS_BADGE_VARIANT = {
  [DELAY_STATUS.READY]: 'warning',
  [DELAY_STATUS.ANALYZING]: 'info',
  [DELAY_STATUS.ON_HOLD]: 'danger',
  [DELAY_STATUS.NEEDS_REANALYSIS]: 'neutral',
  [DELAY_STATUS.FINALIZED]: 'success',
  [DELAY_STATUS.NO_RISK]: 'success',
  [DELAY_STATUS.NO_DELAY]: 'neutral',
} as const satisfies Record<DelayStatus, 'warning' | 'info' | 'danger' | 'neutral' | 'success'>

/**
 * 지연 목록의 `currentRun.status`(분석 실행 상태)를 지연 상태 탭 코드로 바꾼다. 서버의 탭 집계와 같은 기준이다.
 * (`STALE`·`FAILED` = 재분석 필요, 진행 중 상태 = 분석 중) 실행이 없으면 null.
 */
export const toDelayStatus = (runStatus: string | null | undefined): DelayStatus | null => {
  switch (runStatus) {
    case undefined:
    case null:
      return null
    case 'READY_FOR_REVIEW':
      return DELAY_STATUS.READY
    case 'ON_HOLD':
      return DELAY_STATUS.ON_HOLD
    case 'STALE':
    case 'FAILED':
      return DELAY_STATUS.NEEDS_REANALYSIS
    case 'FINALIZED':
      return DELAY_STATUS.FINALIZED
    case 'NO_RISK':
      return DELAY_STATUS.NO_RISK
    case 'NO_DELAY':
      return DELAY_STATUS.NO_DELAY
    default:
      return DELAY_STATUS.ANALYZING
  }
}
