/** 화면 경로. 라우터, 메뉴, 화면 이동(`navigate`, `Link`)에서 문자열 대신 이 상수를 사용한다. */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DELAY_CENTER: '/delay-center',
  DECISION_HISTORY: '/decision-history',
  SYNC_DATA: '/sync-data',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
