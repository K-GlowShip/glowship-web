import { formatMMDD } from '@/shared/lib/kst-date'
import { type DelayCase, type SkuImpact } from './delay-center'

/** 날짜 축에 상품별 줄로 그리는 최대 개수. 더 많으면 나머지는 아래 표에서 본다. */
export const MAX_AXIS_ROWS = 5

/** 날짜 눈금이 이 개수 안팎이 되도록 간격을 정한다 */
const TARGET_TICKS = 8
/** 이 위치(%) 이상은 축의 오른쪽 끝으로 본다 */
const AXIS_END_PERCENT = 98
/** 이 위치(%) 이하는 축의 왼쪽 끝으로 본다 */
const AXIS_START_PERCENT = 2

const DAY_MS = 86_400_000
export const toDay = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS)
/** 하루 단위 번호를 'MM.DD'로 바꾼다 */
const formatDay = (day: number) =>
  new Date(day * DAY_MS).toISOString().slice(5, 10).replace('-', '.')

/** 축 오른쪽 끝의 라벨은 가운데 정렬하면 박스 밖으로 나가서, 오른쪽 끝을 위치에 맞춘다 */
const isAxisEnd = (percent: number) => percent >= AXIS_END_PERCENT
/** 축 왼쪽 끝의 라벨은 가운데 정렬하면 왼쪽 라벨 칸(선적 코드)을 덮어서, 왼쪽 끝을 위치에 맞춘다 */
const isAxisStart = (percent: number) => percent <= AXIS_START_PERCENT

/** 축 위 위치에 글자를 놓을 때의 정렬. 양 끝에서는 축 밖으로 나가지 않게 안쪽으로 붙인다. */
export const getAxisAlign = (percent: number): 'start' | 'center' | 'end' =>
  isAxisStart(percent) ? 'start' : isAxisEnd(percent) ? 'end' : 'center'

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
 * 예상 입고 전에 안전재고 아래로 내려가는 상품(SKU·창고 행). 하회일이 입고일 이후인 상품과 판정 불가 상품은 뺀다.
 * 영역의 부제가 "N종 중 M종"을 셀 때 쓰고, 축에는 이 중 앞의 `MAX_AXIS_ROWS`개만 그린다.
 */
export const filterBreachingBeforeInbound = (impacts: SkuImpact[], expectedInbound: string) =>
  impacts.filter(({ estimable, safetyStockBreachDate, stockoutDate }) => {
    const firstDate = safetyStockBreachDate ?? stockoutDate
    return estimable && firstDate !== null && toDay(firstDate) < toDay(expectedInbound)
  })

/** 한 상품이 여러 창고에 있으면 행이 여럿이라, 상품 수는 SKU 코드로 센다 */
export const countSkus = (impacts: SkuImpact[]) =>
  new Set(impacts.map(({ skuCode }) => skuCode)).size

/**
 * 날짜 축에 그릴 상품을 고른다. 예상 입고 전에 안전재고 아래로 내려가는 상품만 `MAX_AXIS_ROWS`개까지 그리고,
 * 나머지는 아래 상품별 표에서 본다.
 */
export const pickAxisRows = (impacts: SkuImpact[], expectedInbound: string) =>
  filterBreachingBeforeInbound(impacts, expectedInbound).slice(0, MAX_AXIS_ROWS)

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

/** 일정판 맨 위에 그리는 선적. 선적 줄과 스크린 리더 문장이 이 값을 쓴다 */
export type AxisShipment = Pick<
  DelayCase,
  'shipmentCode' | 'transportMode' | 'skuCount' | 'plannedInbound' | 'expectedInbound'
>

/**
 * 스크린 리더가 그래프 대신 읽는 문장. 화면의 위계대로 선적(입고 일정)을 먼저 읽고, 그 아래 실린 상품을 하나씩 읽는다.
 * 예: "선적 OCN-1: 계획 입고 07.03, 예상 입고 09.22(81일 지연). 실린 상품 8종 중 1종 — A: 09.04 안전재고 하회, 09.19 재고 소진"
 */
export const buildAxisSummary = (
  rows: SkuImpact[],
  { shipmentCode, skuCount, plannedInbound, expectedInbound }: AxisShipment,
) => {
  const { isDelayed, delayDays } = getInboundDelay(plannedInbound, expectedInbound)
  const inbound = `계획 입고 ${formatMMDD(plannedInbound)}, 예상 입고 ${formatMMDD(expectedInbound)}${
    isDelayed ? `(${delayDays}일 지연)` : ''
  }`
  const products = rows.map((row) =>
    row.estimable
      ? `${row.productName}: ${[
          row.safetyStockBreachDate && `${formatMMDD(row.safetyStockBreachDate)} 안전재고 하회`,
          row.stockoutDate && `${formatMMDD(row.stockoutDate)} 재고 소진`,
        ]
          .filter(Boolean)
          .join(', ')}`
      : `${row.productName}: 판정 불가`,
  )

  // 화면 머리의 "상품 N종"은 선적에 실린 전체이고, 일정판에는 그중 일부만 그려서 둘을 함께 읽어 준다
  const shown = countSkus(rows)
  const loaded = shown === skuCount ? `${skuCount}종` : `${skuCount}종 중 ${shown}종`

  return `선적 ${shipmentCode}: ${inbound}. 실린 상품 ${loaded} — ${products.join(' / ')}`
}
