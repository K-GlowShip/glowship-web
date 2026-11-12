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

/** 로그인 뒤에 돌아갈 화면을 담는 쿼리 이름. 예: /login?redirect=%2Fdelay-center%2Fde-1024 */
const LOGIN_REDIRECT_PARAM = 'redirect'

/**
 * 로그인 뒤에 돌아가도 되는 경로인지 확인한다. 앱 안의 경로만 허용한다.
 * 주소는 누구나 만들 수 있어서, 확인 없이 쓰면 로그인한 사용자를 바깥 사이트로 보내는 링크를 만들 수 있다.
 * `//example.com`처럼 `/`로 시작해도 다른 사이트로 읽히는 주소가 있어서, 브라우저와 같은 방식으로 해석해
 * 지금 사이트와 같은 곳인지 본다. 로그인 화면은 돌아갈 곳이 아니다.
 */
const isSafeRedirect = (path: string) => {
  if (!path.startsWith('/')) {
    return false
  }

  try {
    const { origin } = window.location
    const url = new URL(path, origin)
    return url.origin === origin && url.pathname.replace(/\/+$/, '') !== ROUTES.LOGIN
  } catch {
    return false
  }
}

/**
 * 로그인 화면 경로. 보던 화면(`from`)을 주면 로그인 뒤에 그곳으로 돌아가도록 주소에 담는다.
 * 대시보드는 로그인 뒤의 기본 화면이라 담지 않는다.
 */
export const loginPath = (from?: string) =>
  from && from !== '/' && from !== ROUTES.DASHBOARD && isSafeRedirect(from)
    ? `${ROUTES.LOGIN}?${LOGIN_REDIRECT_PARAM}=${encodeURIComponent(from)}`
    : ROUTES.LOGIN

/** 로그인 뒤에 갈 경로. 로그인 화면 주소의 쿼리(`search`)에 돌아갈 화면이 있으면 그곳, 없거나 쓸 수 없으면 대시보드다. */
export const getLoginRedirect = (search: string) => {
  const redirect = new URLSearchParams(search).get(LOGIN_REDIRECT_PARAM)
  return redirect && isSafeRedirect(redirect) ? redirect : ROUTES.DASHBOARD
}
