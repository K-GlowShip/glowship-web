import { describe, expect, it } from 'vitest'

import { getAnalysisPollInterval } from './analysis-poll-interval'

describe('getAnalysisPollInterval', () => {
  it('시작 직후에는 짧게 읽는다', () => {
    expect(getAnalysisPollInterval(0)).toBe(1_500)
    expect(getAnalysisPollInterval(19_999)).toBe(1_500)
  })

  it('오래 걸릴수록 간격이 늘어난다', () => {
    expect(getAnalysisPollInterval(20_000)).toBe(3_000)
    expect(getAnalysisPollInterval(59_999)).toBe(3_000)
    expect(getAnalysisPollInterval(60_000)).toBe(5_000)
    expect(getAnalysisPollInterval(170_000)).toBe(5_000)
  })
})
