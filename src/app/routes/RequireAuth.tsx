import { Navigate, Outlet } from 'react-router'

import { useIsLoggedIn } from '@/entities/session'
import { ROUTES } from '@/shared/config'

/** 로그인하지 않았으면 로그인 페이지로 보낸다. */
export function RequireAuth() {
  const isLoggedIn = useIsLoggedIn()

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  return <Outlet />
}
