import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ANALYSIS_POLL_LIMIT_MS, useAnalysisPollLimit } from './use-analysis-poll-limit'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

const passTime = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('useAnalysisPollLimit', () => {
  it('제한 시간 전에는 계속 읽고, 지나면 멈춘다', () => {
    const { result } = renderHook(() => useAnalysisPollLimit(true, 'run-1'))

    passTime(ANALYSIS_POLL_LIMIT_MS - 1)
    expect(result.current.isTimedOut).toBe(false)

    passTime(1)
    expect(result.current.isTimedOut).toBe(true)
  })

  it('분석이 끝나면(진행 중이 아니면) 시간을 세지 않는다', () => {
    const { result } = renderHook(() => useAnalysisPollLimit(false, 'run-1'))

    passTime(ANALYSIS_POLL_LIMIT_MS * 2)

    expect(result.current.isTimedOut).toBe(false)
  })

  it('다시 확인하면 처음부터 다시 센다', () => {
    const { result } = renderHook(() => useAnalysisPollLimit(true, 'run-1'))
    passTime(ANALYSIS_POLL_LIMIT_MS)
    expect(result.current.isTimedOut).toBe(true)

    act(() => result.current.restart())
    expect(result.current.isTimedOut).toBe(false)

    passTime(ANALYSIS_POLL_LIMIT_MS)
    expect(result.current.isTimedOut).toBe(true)
  })

  it('다른 실행으로 바뀌면 시간을 다시 센다', () => {
    const { result, rerender } = renderHook(({ runId }) => useAnalysisPollLimit(true, runId), {
      initialProps: { runId: 'run-1' },
    })
    passTime(ANALYSIS_POLL_LIMIT_MS)
    expect(result.current.isTimedOut).toBe(true)

    rerender({ runId: 'run-2' })

    expect(result.current.isTimedOut).toBe(false)
  })
})
