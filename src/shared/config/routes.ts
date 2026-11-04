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

/** 지연 건의 상세 화면 경로. 예: /delay-center/de-1024 */
export const delayCenterPath = (delayEventId: string) =>
  `${ROUTES.DELAY_CENTER}/${encodeURIComponent(delayEventId)}`
