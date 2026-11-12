import { describe, expect, it } from 'vitest'

import { CREEP_RATIO, toCreepPosition, toStopPosition } from './analysis-voyage'

describe('analysis-voyage', () => {
  it('정거장은 같은 간격으로 놓인다', () => {
    expect([0, 1, 2, 3].map((index) => toStopPosition(index, 4))).toEqual([
      '0%',
      '33.33333333333333%',
      '66.66666666666666%',
      '100%',
    ])
  })

  it('기다리는 동안은 다음 정거장 쪽으로 가되 정거장에는 닿지 않는다', () => {
    const next = (1 / 3) * 100
    const creep = parseFloat(toCreepPosition(0, 4))

    expect(creep).toBeCloseTo(next * CREEP_RATIO)
    expect(creep).toBeLessThan(next)
  })

  it('마지막 정거장에서는 더 나아가지 않는다', () => {
    expect(toCreepPosition(3, 4)).toBe(toStopPosition(3, 4))
  })
})
