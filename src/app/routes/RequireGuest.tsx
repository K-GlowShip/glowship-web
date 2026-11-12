import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { SESSION_STATUS, useSession } from '@/entities/session'
import { LoginSkeleton } from '@/pages/login'
import { getLoginRedirect } from '@/shared/config'

/**
 * 이미 로그인했으면 돌아갈 화면(없으면 대시보드)으로 보낸다. 로그인 페이지처럼 비로그인 사용자용 화면에 쓴다.
 * 로그인 여부를 확인하지 못해도(서버·네트워크 오류) 폼은 보여 준다. 로그인을 시도하면 오류가 안내된다.
 * 처음 확인이 끝난 뒤에는 로딩 화면으로 바꾸지 않는다. 숨겨진 창이 다시 보일 때 로그인 여부를 다시 확인하는데,
 * 이때 화면을 로딩으로 바꾸면 로그인 폼이 사라졌다 다시 그려져서 입력해 둔 값이 지워진다.
 */
export function RequireGuest() {
  const { status } = useSession()
  const { search } = useLocation()
  const [hasSettled, setHasSettled] = useState(false)

  if (status !== SESSION_STATUS.LOADING && !hasSettled) {
    setHasSettled(true)
  }
  if (status === SESSION_STATUS.LOADING && !hasSettled) {
    return <LoginSkeleton />
  }
  if (status === SESSION_STATUS.AUTHENTICATED) {
    return <Navigate to={getLoginRedirect(search)} replace />
  }
  return <Outlet />
}
