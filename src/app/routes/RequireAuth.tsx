import { Navigate, Outlet, useLocation } from 'react-router'

import { SESSION_STATUS, useSession } from '@/entities/session'
import { loginPath } from '@/shared/config'

import { RouteFallback } from './RouteFallback'
import { SessionError } from './SessionError'

/** 로그인하지 않았으면 로그인 페이지로 보낸다. 보던 화면을 주소에 담아서 로그인 뒤에 그곳으로 돌아오게 한다. */
export function RequireAuth() {
  const { status, error, retry, isRetrying } = useSession()
  const { pathname, search, hash } = useLocation()

  if (status === SESSION_STATUS.LOADING) {
    return <RouteFallback />
  }
  if (status === SESSION_STATUS.ERROR) {
    return <SessionError message={error?.message} loading={isRetrying} onRetry={retry} />
  }
  if (status === SESSION_STATUS.UNAUTHENTICATED) {
    return <Navigate to={loginPath(pathname + search + hash)} replace />
  }
  return <Outlet />
}
