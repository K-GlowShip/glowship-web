import { Navigate, Outlet } from 'react-router'

import { SESSION_STATUS, useSession } from '@/entities/session'
import { ROUTES } from '@/shared/config'

import { RouteFallback } from './RouteFallback'
import { SessionError } from './SessionError'

/** 로그인하지 않았으면 로그인 페이지로 보낸다. */
export function RequireAuth() {
  const { status, error, retry, isRetrying } = useSession()

  if (status === SESSION_STATUS.LOADING) {
    return <RouteFallback />
  }
  if (status === SESSION_STATUS.ERROR) {
    return <SessionError message={error?.message} loading={isRetrying} onRetry={retry} />
  }
  if (status === SESSION_STATUS.UNAUTHENTICATED) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  return <Outlet />
}
