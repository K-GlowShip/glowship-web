import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, delayEventQueries, requestReanalysis } from '@/shared/api'
import { toastError } from '@/shared/ui/toast'

import { useReanalysis } from './use-reanalysis'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  requestReanalysis: vi.fn(),
}))
vi.mock('@/shared/ui/toast', () => ({ toastError: vi.fn(), Toaster: () => null }))

const RUN_ID = 'run-1'

const setup = () => {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { invalidate, ...renderHook(() => useReanalysis(RUN_ID), { wrapper }) }
}

const refetchedDelayEvents = (invalidate: ReturnType<typeof setup>['invalidate']) =>
  invalidate.mock.calls.some(([filters]) => filters?.queryKey === delayEventQueries.all)

beforeEach(() => {
  vi.mocked(requestReanalysis).mockResolvedValue({
    runId: 'run-2',
    versionNo: 2,
    parentRunId: RUN_ID,
    status: 'DETECTED',
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useReanalysis', () => {
  it('현재 실행에 재분석을 요청하고 화면을 다시 읽는다', async () => {
    const { result, invalidate } = setup()

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(requestReanalysis).toHaveBeenCalledWith(RUN_ID)
    expect(refetchedDelayEvents(invalidate)).toBe(true)
    expect(toastError).not.toHaveBeenCalled()
  })

  it('이미 진행 중이라 거절되면(409) 이유를 알리고 화면을 다시 읽는다', async () => {
    vi.mocked(requestReanalysis).mockRejectedValue(
      new ApiError({ status: 409, code: 'RUN_IN_PROGRESS', message: '이미 분석 중입니다.' }),
    )
    const { result, invalidate } = setup()

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toastError).toHaveBeenCalledWith('이미 분석 중입니다.')
    expect(refetchedDelayEvents(invalidate)).toBe(true)
  })

  it('그 밖의 오류는 알리기만 하고 다시 읽지 않는다', async () => {
    vi.mocked(requestReanalysis).mockRejectedValue(
      new ApiError({
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: '잠시 뒤 다시 시도해 주세요.',
      }),
    )
    const { result, invalidate } = setup()

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toastError).toHaveBeenCalledWith('잠시 뒤 다시 시도해 주세요.')
    expect(refetchedDelayEvents(invalidate)).toBe(false)
  })
})
