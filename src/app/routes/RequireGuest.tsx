import { Navigate, Outlet } from 'react-router'

import { SESSION_STATUS, useSession } from '@/entities/session'
import { ROUTES } from '@/shared/config'

import { RouteFallback } from './RouteFallback'

/**
 * 이미 로그인했으면 대시보드로 보낸다. 로그인 페이지처럼 비로그인 사용자용 화면에 쓴다.
 * 로그인 여부를 확인하지 못해도(서버·네트워크 오류) 폼은 보여 준다. 로그인을 시도하면 오류가 안내된다.
 */
export function RequireGuest() {
  const { status } = useSession()

  if (status === SESSION_STATUS.LOADING) {
    return <RouteFallback />
  }
  if (status === SESSION_STATUS.AUTHENTICATED) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  return <Outlet />
}
