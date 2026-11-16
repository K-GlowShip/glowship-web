import { INBOUND_TREND_DAYS, type InboundTrendDays, type InboundTrendPoint } from '@/shared/api'
import { formatMMDD } from '@/shared/lib/kst-date'

/**
 * 3PL 입고 추이 그래프의 막대. 서버는 하루 단위 점(`InboundTrendPoint`)을 주지만 하루 건수가 0~1에 머물러
 * 긴 기간은 일별로 그리면 톱니만 남는다. 그래서 짧은 기간은 하루 한 막대, 긴 기간은 7일씩 묶은 막대로 보여 준다.
 */

/** 막대 하나가 묶는 기간 */
export const TREND_BUCKET = {
  DAY: 'DAY',
  WEEK: 'WEEK',
} as const

export type TrendBucket = (typeof TREND_BUCKET)[keyof typeof TREND_BUCKET]

/** 주 단위로 묶을 때 한 막대가 담는 일수 */
export const WEEK_DAYS = 7

/** 이 일수까지는 하루 단위 막대로 보여 준다. 더 길면 주 단위로 묶는다 */
export const MAX_DAILY_TREND_DAYS: InboundTrendDays = INBOUND_TREND_DAYS.WEEK

/** 세로축 위쪽 한도의 최솟값. 값이 1~2건뿐일 때 막대가 그래프 꼭대기까지 닿지 않게 한다 */
export const MIN_Y_AXIS_MAX = 3

/** 구간 하나에 날짜 라벨 하나가 겹치지 않고 들어가는 최소 폭(px). 모자라면 한 칸씩 걸러 규칙적으로 보인다 */
export const TICK_MIN_WIDTH = 46

export const TREND_BUCKET_LABEL: Record<TrendBucket, string> = {
  [TREND_BUCKET.DAY]: '일 단위',
  [TREND_BUCKET.WEEK]: '주 단위 합계',
}

export interface TrendBar {
  /** 구간 시작·끝 날짜 `YYYY-MM-DD`(끝 포함). 하루 막대면 둘이 같다 */
  from: string
  to: string
  /** 가로축 눈금. 구간 시작 날짜 `MM.DD` */
  tick: string
  /** 툴팁의 구간 표기. 하루면 `MM.DD`, 여러 날이면 `MM.DD~MM.DD` */
  rangeLabel: string
  /** 구간에 담긴 일수 */
  dayCount: number
  plannedCount: number
  actualCount: number
}

/** 기간에 맞는 묶음 단위 */
export const toTrendBucket = (days: InboundTrendDays): TrendBucket =>
  days <= MAX_DAILY_TREND_DAYS ? TREND_BUCKET.DAY : TREND_BUCKET.WEEK

const toBar = (chunk: InboundTrendPoint[]): TrendBar => {
  const from = chunk[0].date
  const to = chunk[chunk.length - 1].date
  return {
    from,
    to,
    tick: formatMMDD(from),
    rangeLabel: from === to ? formatMMDD(from) : `${formatMMDD(from)}~${formatMMDD(to)}`,
    dayCount: chunk.length,
    plannedCount: chunk.reduce((sum, point) => sum + point.plannedCount, 0),
    actualCount: chunk.reduce((sum, point) => sum + point.actualCount, 0),
  }
}

/**
 * 하루 단위 점을 막대로 바꾼다. 주 단위면 **기준일(마지막 날)을 포함하는 마지막 구간이 꼭 7일이 되도록 뒤에서부터**
 * 7일씩 묶고, 앞쪽에 7일이 안 되는 날이 남으면 그만큼만 담은 짧은 첫 구간으로 둔다(합계는 그대로 보존된다).
 * 점은 서버가 준 날짜 순서(오름차순)라고 본다
 */
export const toTrendBars = (points: InboundTrendPoint[], days: InboundTrendDays): TrendBar[] => {
  if (toTrendBucket(days) === TREND_BUCKET.DAY) {
    return points.map((point) => toBar([point]))
  }
  const bucketCount = Math.ceil(points.length / WEEK_DAYS)

  return Array.from({ length: bucketCount }, (_, index) => {
    // 기준일이 있는 마지막 구간이 꼭 7일이 되도록 뒤에서부터 센다
    const end = points.length - (bucketCount - 1 - index) * WEEK_DAYS
    return toBar(points.slice(Math.max(0, end - WEEK_DAYS), end))
  })
}

/** 세로축 눈금 간격 후보. 1·2·5의 10의 거듭제곱 배수 중 필요한 간격 이상인 가장 작은 값을 고른다 */
const NICE_STEP_BASES = [1, 2, 5] as const
/** 세로축을 몇 칸으로 나눌지(눈금은 이보다 하나 많다) */
const Y_AXIS_INTERVALS = 4

const toNiceStep = (rawStep: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rawStep, 1)))
  return (
    NICE_STEP_BASES.map((base) => base * magnitude).find((step) => step >= rawStep) ??
    10 * magnitude
  )
}

/**
 * 세로축 눈금. 가장 큰 막대가 작아도 위쪽 한도를 `MIN_Y_AXIS_MAX` 아래로 내리지 않고(값 1이 꼭대기까지 닿지 않게),
 * 크면 1·2·5 단위의 고른 간격으로 나눠 맨 위 눈금이 어중간한 수가 되지 않게 한다. 항상 정수다
 */
export const toYAxisTicks = (dataMax: number): number[] => {
  const max = Math.max(MIN_Y_AXIS_MAX, Math.ceil(dataMax))
  const step = max <= Y_AXIS_INTERVALS ? 1 : toNiceStep(max / Y_AXIS_INTERVALS)
  const top = Math.ceil(max / step) * step
  return Array.from({ length: top / step + 1 }, (_, i) => i * step)
}

/** 가로축 라벨을 모두 보일지(0), 한 칸씩 거를지(1). 모든 라벨이 겹치지 않고 들어가면 전부 보인다 */
export const toTickInterval = (chartWidth: number, count: number) =>
  chartWidth / Math.max(count, 1) >= TICK_MIN_WIDTH ? 0 : 1
