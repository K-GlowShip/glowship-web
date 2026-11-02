import { Navigate, Outlet } from 'react-router'

import { useIsLoggedIn } from '@/entities/session'
import { ROUTES } from '@/shared/config'

/** 이미 로그인했으면 대시보드로 보낸다. 로그인 페이지처럼 비로그인 사용자용 화면에 쓴다. */
export function RequireGuest() {
  const isLoggedIn = useIsLoggedIn()

  if (isLoggedIn) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  return <Outlet />
}
