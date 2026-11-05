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
