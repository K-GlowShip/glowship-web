import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getDashboardSummary } from '@/shared/api/endpoints/dashboard'
import { getDelayEvents } from '@/shared/api/endpoints/delay-events'

import { NotificationBell } from './NotificationBell'

// 쿼리 정의가 엔드포인트 모듈을 직접 가져오므로 그 모듈을 대체한다
vi.mock('@/shared/api/endpoints/dashboard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api/endpoints/dashboard')>()),
  getDashboardSummary: vi.fn(),
}))
vi.mock('@/shared/api/endpoints/delay-events', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api/endpoints/delay-events')>()),
  getDelayEvents: vi.fn(),
}))

const LAST_SYNCED_AT = '2026-07-02T03:00:00Z'

const mockApi = (lastSyncedAt: string | null, totalCount: number) => {
  vi.mocked(getDashboardSummary).mockResolvedValue({ lastSyncedAt } as never)
  vi.mocked(getDelayEvents).mockResolvedValue({ items: [], totalCount } as never)
}

const renderBell = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('NotificationBell', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('새 지연이 있으면 건수를 배지와 이름에 보여 주고 새 지연 목록으로 연결한다', async () => {
    mockApi(LAST_SYNCED_AT, 3)
    renderBell()

    const link = await screen.findByRole('link', { name: '알림, 새 지연 3건' })
    expect(link.getAttribute('href')).toContain('hasFinalDecision=false')
    expect(link.getAttribute('href')).toContain('from=2026-07-01T03%3A00%3A00Z')
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('99건을 넘으면 99+로 줄여 보여 준다', async () => {
    mockApi(LAST_SYNCED_AT, 120)
    renderBell()

    await screen.findByRole('link', { name: '알림, 새 지연 120건' })
    expect(screen.getByText('99+')).toBeTruthy()
  })

  it('새 지연이 없으면 배지를 보이지 않는다', async () => {
    mockApi(LAST_SYNCED_AT, 0)
    renderBell()

    await screen.findByRole('link', { name: '알림, 새 지연 없음' })
    expect(screen.queryByText('0')).toBeNull()
  })

  it('수집된 데이터가 없으면 건수를 묻지 않고 지연 대응 센터 목록으로만 연결한다', async () => {
    mockApi(null, 5)
    renderBell()

    const link = await screen.findByRole('link', { name: '알림, 새 지연 없음' })
    expect(link.getAttribute('href')).toBe('/delay-center')
    expect(getDelayEvents).not.toHaveBeenCalled()
  })
})
