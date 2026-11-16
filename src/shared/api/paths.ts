/**
 * 백엔드 요청 경로. 서버 주소, `/api`, 기본 버전(`getVersionUrl`)은 포함하지 않는다.
 * 기본 버전이 아닌 경로는 버전을 직접 적는다. (예: '/v2/signup')
 * 실제 백엔드 API 명세에 있는 경로만 추가한다.
 */
export const ENDPOINT = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  ME: '/me',
  DATA_SYNC_RUNS: {
    ROOT: '/data-sync-runs',
    LATEST: '/data-sync-runs/latest',
  },
  SKUS: '/skus',
  ORDERS: '/orders',
  INVENTORY: '/inventory',
  SHIPMENTS: '/shipments',
  DECISIONS: '/decisions',
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    INBOUND_TREND: '/dashboard/inbound-trend',
  },
  INVENTORY_STATUS: '/inventory-status',
  DELAY_EVENTS: '/delay-events',
  ANALYSIS_RUNS: '/analysis-runs',
} as const
