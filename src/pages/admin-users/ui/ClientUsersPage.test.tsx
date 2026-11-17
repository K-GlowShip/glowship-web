import { QueryClient, QueryClientProvider, queryOptions } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type AssignedCompany,
  CLIENT_ROLE_CODE,
  type ClientUser,
  type GetClientUsersParams,
  USER_STATUS,
} from '@/shared/api'

import { ClientUsersPage } from './ClientUsersPage'

const mockCompanies = vi.hoisted(() => ({ current: [] as AssignedCompany[] }))
const getClientUsers = vi.hoisted(() => vi.fn())

vi.mock('@/entities/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/session')>()),
  useAssignedCompanies: () => mockCompanies.current,
}))

// 서버 요청 대신 목록 응답을 정하려고 공개 API의 목록 쿼리만 바꾼다
vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    adminUserQueries: {
      ...actual.adminUserQueries,
      list: (params: GetClientUsersParams) =>
        queryOptions({
          queryKey: ['test-client-users', params],
          queryFn: () => getClientUsers(params),
          // 실제 쿼리처럼 잠시 재사용한다
          staleTime: 30_000,
        }),
    },
  }
})

const company = (name: string, canManageClientAccounts = true): AssignedCompany => ({
  companyId: `id-${name}`,
  companyName: name,
  canManageClientAccounts,
})

const user = (overrides: Partial<ClientUser> = {}): ClientUser => ({
  userId: 'u1',
  email: 'lead@client.com',
  displayName: '홍길동',
  roleCode: CLIENT_ROLE_CODE.CLIENT_LEAD,
  status: USER_STATUS.ACTIVE,
  createdAt: '2026-10-21T00:30:00Z',
  ...overrides,
})

const page = (items: ClientUser[]) => ({
  items,
  page: 1,
  size: 20,
  totalCount: items.length,
  totalPages: items.length ? 1 : 0,
})

const renderPage = (companies: AssignedCompany[]) => {
  mockCompanies.current = companies
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ClientUsersPage />
    </QueryClientProvider>,
  )
}

// jsdom에는 없어서, 선택 상자가 열릴 때 강조된 항목으로 스크롤하는 호출이 막힌다
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  // 역할 탭이 밑줄 위치를 재려고 쓰는데 jsdom에는 없다
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

beforeEach(() => {
  getClientUsers.mockResolvedValue(page([user()]))
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const lastParams = () => getClientUsers.mock.lastCall?.[0] as GetClientUsersParams | undefined

describe('ClientUsersPage', () => {
  it('담당 고객사가 없으면 안내를 보여 주고 목록은 요청하지 않는다', () => {
    renderPage([])

    expect(screen.getByRole('alert').textContent).toContain('담당 고객사가 없어')
    expect(getClientUsers).not.toHaveBeenCalled()
  })

  it('첫 고객사의 계정 목록을 보여 준다', async () => {
    renderPage([company('A Beauty')])

    expect(await screen.findByText('홍길동')).toBeTruthy()
    expect(screen.getByText('lead@client.com')).toBeTruthy()
    expect(within(screen.getByRole('table')).getByText('팀장')).toBeTruthy()
    expect(screen.getByText('사용 중')).toBeTruthy()
    expect(lastParams()).toMatchObject({ companyId: 'id-A Beauty', page: 1 })
  })

  it('계정이 없으면 빈 목록 문구를 보여 준다', async () => {
    getClientUsers.mockResolvedValue(page([]))
    renderPage([company('A Beauty')])

    expect(await screen.findByText('등록된 계정이 없습니다.')).toBeTruthy()
  })

  it('계정 관리 권한이 없으면 목록은 보이고 만들기 버튼은 없다', async () => {
    renderPage([company('A Beauty', false)])

    expect(await screen.findByText('홍길동')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '계정 만들기' })).toBeNull()
    expect(screen.getByText('계정 관리 권한이 없어 조회만 할 수 있습니다.')).toBeTruthy()
  })

  it('계정 만들기를 누르면 그 고객사의 생성 드로어가 열린다', async () => {
    renderPage([company('A Beauty')])

    await userEvent.click(await screen.findByRole('button', { name: '계정 만들기' }))

    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('A Beauty에 팀장·팀원 계정을 만듭니다.')).toBeTruthy()
    expect(within(drawer).getByLabelText('이름')).toBeTruthy()
  })

  it('고객사를 바꾸면 그 고객사의 목록을 다시 받는다', async () => {
    renderPage([company('A Beauty'), company('B Beauty')])
    await screen.findByText('홍길동')

    await userEvent.click(screen.getByRole('combobox', { name: '고객사' }))
    await userEvent.click(screen.getByRole('option', { name: 'B Beauty' }))

    await waitFor(() => expect(lastParams()).toMatchObject({ companyId: 'id-B Beauty', page: 1 }))
  })

  it('역할을 고르면 그 역할만 요청하고, 전체로 돌리면 처음 목록을 다시 쓴다', async () => {
    renderPage([company('A Beauty')])
    await screen.findByText('홍길동')

    await userEvent.click(screen.getByRole('tab', { name: '팀원' }))
    await waitFor(() => expect(lastParams()?.roleCode).toBe(CLIENT_ROLE_CODE.CLIENT_MEMBER))

    await userEvent.click(screen.getByRole('tab', { name: '전체' }))
    // 처음과 같은 조건이라 캐시된 목록을 쓰고 새 요청은 나가지 않는다
    expect(screen.getByRole('tab', { name: '전체' }).getAttribute('aria-selected')).toBe('true')
    expect(getClientUsers).toHaveBeenCalledTimes(2)
  })
})
