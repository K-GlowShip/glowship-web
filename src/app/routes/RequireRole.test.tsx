import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSession } from '@/entities/session'
import { ROLE_CODE } from '@/shared/api'
import { ROUTES } from '@/shared/config'

import { RequireRole } from './RequireRole'

vi.mock('@/entities/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/session')>()),
  useSession: vi.fn(),
}))

const renderGuard = (area: 'client' | 'internal', roleCode: string | undefined) => {
  vi.mocked(useSession).mockReturnValue({
    me: roleCode ? { roleCode } : undefined,
  } as ReturnType<typeof useSession>)

  render(
    <MemoryRouter initialEntries={['/guarded']}>
      <Routes>
        <Route element={<RequireRole area={area} />}>
          <Route path="/guarded" element={<p>보호된 화면</p>} />
        </Route>
        <Route path={ROUTES.ADMIN_HOME} element={<p>관리 화면</p>} />
        <Route path={ROUTES.DASHBOARD} element={<p>대시보드</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('RequireRole', () => {
  it.each([ROLE_CODE.OWNER, ROLE_CODE.ADMIN])(
    '%s는 고객사 화면 대신 관리 화면으로 간다',
    (role) => {
      renderGuard('client', role)

      expect(screen.getByText('관리 화면')).toBeTruthy()
    },
  )

  it.each([ROLE_CODE.CLIENT_MEMBER, ROLE_CODE.CLIENT_LEAD])(
    '%s는 관리 화면 대신 대시보드로 간다',
    (role) => {
      renderGuard('internal', role)

      expect(screen.getByText('대시보드')).toBeTruthy()
    },
  )

  it('고객사 계정은 고객사 화면을, 내부 계정은 관리 화면을 본다', () => {
    renderGuard('client', ROLE_CODE.CLIENT_LEAD)
    expect(screen.getByText('보호된 화면')).toBeTruthy()
    cleanup()

    renderGuard('internal', ROLE_CODE.ADMIN)
    expect(screen.getByText('보호된 화면')).toBeTruthy()
  })

  it('내 계정이 없는 데모 세션은 고객사 계정으로 본다', () => {
    renderGuard('client', undefined)
    expect(screen.getByText('보호된 화면')).toBeTruthy()
    cleanup()

    renderGuard('internal', undefined)
    expect(screen.getByText('대시보드')).toBeTruthy()
  })
})
