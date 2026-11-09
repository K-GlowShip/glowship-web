import { ANALYSIS_RUN_STATUS, type DelayEventCounts } from '@/shared/api'

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

/** 지연 상태 코드에 해당하는 `GET /delay-events` 응답 `counts`의 키 */
export const DELAY_COUNT_KEY: Record<DelayStatus, keyof DelayEventCounts> = {
  [DELAY_STATUS.READY]: 'readyForReview',
  [DELAY_STATUS.ANALYZING]: 'analyzing',
  [DELAY_STATUS.ON_HOLD]: 'onHold',
  [DELAY_STATUS.NEEDS_REANALYSIS]: 'needsReanalysis',
  [DELAY_STATUS.FINALIZED]: 'finalized',
  [DELAY_STATUS.NO_RISK]: 'noRisk',
  [DELAY_STATUS.NO_DELAY]: 'noDelay',
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
 * (`STALE`·`FAILED` = 재분석 필요, 진행 중 상태 = 분석 중) 실행이 없거나 모르는 상태면 null이다.
 * 모르는 상태를 "분석 중"으로 보여 주면 서버가 상태를 늘렸을 때 틀린 정보가 되므로 상태를 비워 둔다.
 */
export const toDelayStatus = (runStatus: string | null | undefined): DelayStatus | null => {
  switch (runStatus) {
    case ANALYSIS_RUN_STATUS.READY_FOR_REVIEW:
      return DELAY_STATUS.READY
    case ANALYSIS_RUN_STATUS.ON_HOLD:
      return DELAY_STATUS.ON_HOLD
    case ANALYSIS_RUN_STATUS.STALE:
    case ANALYSIS_RUN_STATUS.FAILED:
      return DELAY_STATUS.NEEDS_REANALYSIS
    case ANALYSIS_RUN_STATUS.FINALIZED:
      return DELAY_STATUS.FINALIZED
    case ANALYSIS_RUN_STATUS.NO_RISK:
      return DELAY_STATUS.NO_RISK
    case ANALYSIS_RUN_STATUS.NO_DELAY:
      return DELAY_STATUS.NO_DELAY
    case ANALYSIS_RUN_STATUS.DETECTED:
    case ANALYSIS_RUN_STATUS.VALIDATING:
    case ANALYSIS_RUN_STATUS.ANALYZING_IMPACT:
    case ANALYSIS_RUN_STATUS.ANALYZING_OPTIONS:
    case ANALYSIS_RUN_STATUS.VALIDATING_OUTPUT:
      return DELAY_STATUS.ANALYZING
    default:
      return null
  }
}
