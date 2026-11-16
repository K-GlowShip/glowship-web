import { describe, expect, it } from 'vitest'

import { INBOUND_TREND_DAYS, type InboundTrendPoint } from '@/shared/api'
import { addDays } from '@/shared/lib/kst-date'

import {
  MIN_Y_AXIS_MAX,
  TICK_MIN_WIDTH,
  toTrendBars,
  toTrendBucket,
  toTickInterval,
  toYAxisTicks,
  TREND_BUCKET,
  WEEK_DAYS,
} from './inbound-trend'

/** 기준일(마지막 날)에서 거꾸로 `days`일치 점. 건수는 날짜 순번으로 정해 합계를 검증하기 쉽게 한다 */
const pointsEndingAt = (baseDate: string, days: number): InboundTrendPoint[] =>
  Array.from({ length: days }, (_, i) => {
    const index = days - 1 - i
    return {
      date: addDays(baseDate, -index),
      plannedCount: i % 3 === 0 ? 1 : 0,
      actualCount: i % 4 === 0 ? 1 : 0,
    }
  })

const sum = (points: { plannedCount: number; actualCount: number }[]) => ({
  planned: points.reduce((s, p) => s + p.plannedCount, 0),
  actual: points.reduce((s, p) => s + p.actualCount, 0),
})

describe('toTrendBars', () => {
  it('7일은 하루 한 막대 그대로이고 눈금·구간 표기는 MM.DD다', () => {
    const points = pointsEndingAt('2026-07-03', 7)
    const bars = toTrendBars(points, INBOUND_TREND_DAYS.WEEK)

    expect(toTrendBucket(INBOUND_TREND_DAYS.WEEK)).toBe(TREND_BUCKET.DAY)
    expect(bars).toHaveLength(7)
    expect(bars[0]).toMatchObject({
      from: '2026-06-27',
      to: '2026-06-27',
      tick: '06.27',
      rangeLabel: '06.27',
      dayCount: 1,
    })
    expect(bars.at(-1)).toMatchObject({ from: '2026-07-03', to: '2026-07-03', rangeLabel: '07.03' })
    expect(sum(bars)).toEqual(sum(points))
  })

  it('30일은 뒤에서부터 7일씩 묶어 5개 막대가 되고, 마지막 막대가 기준일을 포함하는 꽉 찬 7일이다', () => {
    const points = pointsEndingAt('2026-07-03', 30)
    const bars = toTrendBars(points, INBOUND_TREND_DAYS.MONTH)

    expect(toTrendBucket(INBOUND_TREND_DAYS.MONTH)).toBe(TREND_BUCKET.WEEK)
    expect(bars).toHaveLength(5)
    expect(bars.at(-1)).toMatchObject({
      from: '2026-06-27',
      to: '2026-07-03',
      dayCount: WEEK_DAYS,
      tick: '06.27',
      rangeLabel: '06.27~07.03',
    })
    // 앞쪽에 남는 2일은 짧은 첫 구간으로 둔다
    expect(bars[0]).toMatchObject({
      from: '2026-06-04',
      to: '2026-06-05',
      dayCount: 2,
      rangeLabel: '06.04~06.05',
    })
    expect(bars.slice(1).every((bar) => bar.dayCount === WEEK_DAYS)).toBe(true)
    expect(sum(bars)).toEqual(sum(points))
  })

  it('90일은 13개 막대(첫 구간 6일 + 꽉 찬 12주)이고 합계가 보존된다', () => {
    const points = pointsEndingAt('2026-07-03', 90)
    const bars = toTrendBars(points, INBOUND_TREND_DAYS.QUARTER)

    expect(bars).toHaveLength(13)
    expect(bars[0].dayCount).toBe(6)
    expect(bars.slice(1).every((bar) => bar.dayCount === WEEK_DAYS)).toBe(true)
    expect(bars.at(-1)?.to).toBe('2026-07-03')
    expect(bars.map((bar) => bar.dayCount).reduce((a, b) => a + b, 0)).toBe(90)
    expect(sum(bars)).toEqual(sum(points))
    // 각 막대의 건수는 그 구간 점들의 합이다
    const third = bars[2]
    const thirdPoints = points.filter((p) => p.date >= third.from && p.date <= third.to)
    expect({ planned: third.plannedCount, actual: third.actualCount }).toEqual(sum(thirdPoints))
  })

  it('점이 없으면 막대도 없다', () => {
    expect(toTrendBars([], INBOUND_TREND_DAYS.WEEK)).toEqual([])
    expect(toTrendBars([], INBOUND_TREND_DAYS.QUARTER)).toEqual([])
  })
})

describe('toYAxisTicks', () => {
  it('가장 큰 막대가 작아도 0~3 정수 눈금을 두어 값 1이 꼭대기에 닿지 않는다', () => {
    expect(toYAxisTicks(0)).toEqual([0, 1, 2, 3])
    expect(toYAxisTicks(1)).toEqual([0, 1, 2, 3])
    expect(toYAxisTicks(MIN_Y_AXIS_MAX)).toEqual([0, 1, 2, 3])
  })

  it('크면 1·2·5 단위의 고른 간격으로 나누고 맨 위 눈금은 그 배수로 올린다', () => {
    expect(toYAxisTicks(4)).toEqual([0, 1, 2, 3, 4])
    expect(toYAxisTicks(6)).toEqual([0, 2, 4, 6])
    expect(toYAxisTicks(17)).toEqual([0, 5, 10, 15, 20])
    expect(toYAxisTicks(29)).toEqual([0, 10, 20, 30])
    expect(toYAxisTicks(120)).toEqual([0, 50, 100, 150])
  })
})

describe('toTickInterval', () => {
  it('구간마다 라벨이 들어갈 폭이 있으면 전부 보이고, 모자라면 한 칸씩 거른다', () => {
    expect(toTickInterval(TICK_MIN_WIDTH * 7, 7)).toBe(0)
    expect(toTickInterval(TICK_MIN_WIDTH * 7 - 1, 7)).toBe(1)
    expect(toTickInterval(0, 0)).toBe(1)
  })
})
