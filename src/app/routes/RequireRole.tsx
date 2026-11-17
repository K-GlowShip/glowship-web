import { Navigate, Outlet } from 'react-router'

import { isInternalRole, useSession } from '@/entities/session'
import { ROUTES } from '@/shared/config'

interface RequireRoleProps {
  /** `internal`은 Glowship 내부 계정(`OWNER`·`ADMIN`)의 화면, `client`는 고객사 계정의 화면이다 */
  area: 'internal' | 'client'
}

/**
 * 계정 종류에 맞는 화면만 열어 준다. 내부 계정은 고객사에 소속되지 않아 고객사 데이터 API가 모두 403이라서
 * 고객사 화면 대신 관리 화면으로 보내고, 고객사 계정은 관리 화면 대신 대시보드로 보낸다.
 * 로그인 여부는 앞의 `RequireAuth`가 이미 확인했다. 내 계정이 없는 데모 세션은 고객사 계정으로 본다.
 */
export function RequireRole({ area }: RequireRoleProps) {
  const { me } = useSession()
  const isInternal = isInternalRole(me?.roleCode)

  if (area === 'client' && isInternal) {
    return <Navigate to={ROUTES.ADMIN_HOME} replace />
  }
  if (area === 'internal' && !isInternal) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  return <Outlet />
}
