/** 화면 경로. 라우터, 메뉴, 화면 이동(`navigate`, `Link`)에서 문자열 대신 이 상수를 사용한다. */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DELAY_CENTER: '/delay-center',
  DECISION_HISTORY: '/decision-history',
  SYNC_DATA: '/sync-data',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

/** 지연 대응 센터에서 선택한 지연 건을 담는 쿼리 이름. 예: /delay-center?id=... */
export const DELAY_CENTER_CASE_PARAM = 'id'

/** 지연 대응 센터를 해당 지연 건이 선택된 상태로 여는 경로 */
export const delayCenterPath = (delayEventId: string) =>
  `${ROUTES.DELAY_CENTER}?${DELAY_CENTER_CASE_PARAM}=${encodeURIComponent(delayEventId)}`
