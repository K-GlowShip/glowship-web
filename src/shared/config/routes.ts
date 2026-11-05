/** 화면 경로. 라우터, 메뉴, 화면 이동(`navigate`, `Link`)에서 문자열 대신 이 상수를 사용한다. */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DELAY_CENTER: '/delay-center',
  DELAY_CENTER_DETAIL: '/delay-center/:delayEventId',
  DECISION_HISTORY: '/decision-history',
  SYNC_DATA: '/sync-data',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

/** 지연 상세 경로(`ROUTES.DELAY_CENTER_DETAIL`)의 지연 건 ID 파라미터 이름 */
export const DELAY_EVENT_ID_PARAM = 'delayEventId'

/** 지연 목록의 상태 필터 쿼리 이름. 예: /delay-center?status=READY_FOR_REVIEW */
export const DELAY_LIST_STATUS_PARAM = 'status'

/** 지연 목록의 최종 선택 여부 필터 쿼리 이름. 값은 'true' 또는 'false' (명세 4.4 `hasFinalDecision`) */
export const DELAY_LIST_HAS_FINAL_DECISION_PARAM = 'hasFinalDecision'

/** 지연 목록의 감지 시작 시각 필터 쿼리 이름. UTC ISO 8601이고 이 시각 이후(포함)에 감지된 건만 본다 (명세 4.4 `from`) */
export const DELAY_LIST_FROM_PARAM = 'from'

/** 지연 목록 화면 경로. 상태를 주면 그 탭이 선택된 채로 열린다. */
export const delayCenterListPath = (status?: string) =>
  status
    ? `${ROUTES.DELAY_CENTER}?${DELAY_LIST_STATUS_PARAM}=${encodeURIComponent(status)}`
    : ROUTES.DELAY_CENTER

/** 대시보드 새 지연 알림이 가리키는 목록 경로. 감지 시각 `from` 이후이고 최종 선택이 없는 건이다 (명세 4.4) */
export const delayCenterNewDelaysPath = (from: string) =>
  `${ROUTES.DELAY_CENTER}?${DELAY_LIST_FROM_PARAM}=${encodeURIComponent(from)}&${DELAY_LIST_HAS_FINAL_DECISION_PARAM}=false`

/** 지연 건의 상세 화면 경로. 예: /delay-center/de-1024 */
export const delayCenterPath = (delayEventId: string) =>
  `${ROUTES.DELAY_CENTER}/${encodeURIComponent(delayEventId)}`
