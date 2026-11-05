import { formatMonthDay, type SkuImpact } from './delay-center'

/** 날짜 축에 상품별 줄로 그리는 최대 개수. 더 많으면 나머지는 아래 표에서 본다. */
export const MAX_AXIS_ROWS = 5

/** 날짜 눈금이 이 개수 안팎이 되도록 간격을 정한다 */
const TARGET_TICKS = 8
/** 이 위치(%) 이상은 축의 오른쪽 끝으로 본다 */
const AXIS_END_PERCENT = 98

const DAY_MS = 86_400_000
export const toDay = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS)
/** 하루 단위 번호를 'MM.DD'로 바꾼다 */
const formatDay = (day: number) =>
  new Date(day * DAY_MS).toISOString().slice(5, 10).replace('-', '.')

/** 축 오른쪽 끝의 라벨은 가운데 정렬하면 박스 밖으로 나가서, 오른쪽 끝을 위치에 맞춘다 */
export const isAxisEnd = (percent: number) => percent >= AXIS_END_PERCENT

export interface AxisTick {
  day: number
  /** 축 왼쪽 끝을 0, 오른쪽 끝을 100으로 본 위치 */
  percent: number
  label: string
}

export interface AxisScale {
  /** 'YYYY-MM-DD'를 축 위의 위치(0~100)로 바꾼다 */
  toPercent: (date: string) => number
  ticks: AxisTick[]
}

/**
 * 날짜 축에 그릴 상품을 고른다. 예상 입고 전에 안전재고 아래로 내려가는 상품만 그리고,
 * 하회일이 입고일 이후인 상품과 판정 불가 상품은 아래 상품별 표에서 본다.
 */
export const pickAxisRows = (impacts: SkuImpact[], expectedInbound: string) => {
  const beforeInbound = impacts.filter(({ estimable, safetyStockBreachDate, stockoutDate }) => {
    const firstDate = safetyStockBreachDate ?? stockoutDate
    return estimable && firstDate !== null && toDay(firstDate) < toDay(expectedInbound)
  })
  const rows = beforeInbound.slice(0, MAX_AXIS_ROWS)
  return { rows, hiddenCount: impacts.length - rows.length }
}

/** 그릴 날짜를 모두 담는 범위로 축을 잡고, 날짜의 위치와 눈금을 계산한다 */
export const buildAxisScale = (
  rows: SkuImpact[],
  plannedInbound: string,
  expectedInbound: string,
): AxisScale => {
  const days = [
    toDay(plannedInbound),
    toDay(expectedInbound),
    ...rows.flatMap(({ safetyStockBreachDate, stockoutDate }) =>
      [safetyStockBreachDate, stockoutDate]
        .filter((date): date is string => date !== null)
        .map(toDay),
    ),
  ]
  const min = Math.min(...days)
  // 날짜가 하나뿐이어도 축이 0으로 나뉘지 않게 하루 폭을 준다
  const max = Math.max(Math.max(...days), min + 1)
  const dayToPercent = (day: number) => ((day - min) / (max - min)) * 100

  const tickStep = Math.max(1, Math.ceil((max - min) / TARGET_TICKS))
  const ticks: AxisTick[] = []
  for (let day = min; day <= max; day += tickStep) {
    ticks.push({ day, percent: dayToPercent(day), label: formatDay(day) })
  }

  return { toPercent: (date) => dayToPercent(toDay(date)), ticks }
}

/** 예상 입고일이 계획보다 늦어졌는지와 늦어진 일수 */
export const getInboundDelay = (plannedInbound: string, expectedInbound: string) => {
  const delayDays = toDay(expectedInbound) - toDay(plannedInbound)
  return { isDelayed: delayDays > 0, delayDays }
}

/**
 * 첫 품절일부터 예상 입고 전날까지의 일수. 품절 일수(`stockoutDays`)는 그 안 품절일의 총합이라,
 * 중간에 다른 입고가 있으면 이 값보다 작다(명세 4.5 재고 영향).
 */
export const getStockoutSpanDays = (stockoutDate: string, expectedInbound: string) =>
  toDay(expectedInbound) - toDay(stockoutDate)

/** 스크린 리더가 그래프 대신 읽는 문장 */
export const buildAxisSummary = (
  rows: SkuImpact[],
  plannedInbound: string,
  expectedInbound: string,
) =>
  [
    ...rows.map((row) =>
      row.estimable
        ? `${row.productName}: ${[
            row.safetyStockBreachDate &&
              `${formatMonthDay(row.safetyStockBreachDate)} 안전재고 하회`,
            row.stockoutDate && `${formatMonthDay(row.stockoutDate)} 재고 소진`,
          ]
            .filter(Boolean)
            .join(', ')}`
        : `${row.productName}: 판정 불가`,
    ),
    `계획 입고 ${formatMonthDay(plannedInbound)}, 예상 입고 ${formatMonthDay(expectedInbound)}`,
  ].join(' / ')
