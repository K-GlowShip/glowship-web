import { describe, expect, it } from 'vitest'

import { TRANSPORT_MODE } from '@/shared/api'

import { SKU_SCOPE, type SkuImpact } from './delay-center'
import {
  type AxisShipment,
  buildAxisScale,
  buildAxisSummary,
  countSkus,
  filterBreachingBeforeInbound,
  getAxisAlign,
  getInboundDelay,
  MAX_AXIS_ROWS,
  pickAxisRows,
} from './impact-axis'

const impact = (patch: Partial<SkuImpact> & Pick<SkuImpact, 'skuCode'>): SkuImpact => ({
  productName: `상품 ${patch.skuCode}`,
  region: 'WEST',
  scope: SKU_SCOPE.IMPACTED,
  estimable: true,
  increasedShortage: 0,
  safetyStockBreachDate: null,
  stockoutDate: null,
  stockoutDays: null,
  ...patch,
})

const shipment: AxisShipment = {
  shipmentCode: 'OCN-1',
  transportMode: TRANSPORT_MODE.OCEAN,
  skuCount: 2,
  plannedInbound: '2026-07-03',
  expectedInbound: '2026-09-22',
}

describe('filterBreachingBeforeInbound / pickAxisRows', () => {
  const breaching = impact({
    skuCode: 'SKU-1',
    safetyStockBreachDate: '2026-09-04',
    stockoutDate: '2026-09-19',
    stockoutDays: 3,
  })
  const afterInbound = impact({ skuCode: 'SKU-2', safetyStockBreachDate: '2026-10-01' })
  const notEstimable = impact({ skuCode: 'SKU-3', estimable: false })
  const noDates = impact({ skuCode: 'SKU-4' })

  it('예상 입고 전에 안전재고 아래로 내려가는 판정 가능 상품만 남긴다', () => {
    expect(
      filterBreachingBeforeInbound(
        [breaching, afterInbound, notEstimable, noDates],
        shipment.expectedInbound,
      ),
    ).toEqual([breaching])
  })

  it('하회일이 없고 소진일만 있어도 소진일로 판단한다', () => {
    const stockoutOnly = impact({ skuCode: 'SKU-5', stockoutDate: '2026-08-01', stockoutDays: 10 })
    expect(filterBreachingBeforeInbound([stockoutOnly], shipment.expectedInbound)).toEqual([
      stockoutOnly,
    ])
  })

  it('축에는 앞의 MAX_AXIS_ROWS개만 그리고, 부제용 필터는 모두 센다', () => {
    const many = Array.from({ length: MAX_AXIS_ROWS + 2 }, (_, index) =>
      impact({ skuCode: `SKU-${index}`, safetyStockBreachDate: '2026-08-01' }),
    )
    expect(pickAxisRows(many, shipment.expectedInbound)).toHaveLength(MAX_AXIS_ROWS)
    expect(filterBreachingBeforeInbound(many, shipment.expectedInbound)).toHaveLength(
      MAX_AXIS_ROWS + 2,
    )
  })
})

describe('countSkus', () => {
  it('같은 상품이 여러 창고에 있으면 한 종으로 센다', () => {
    expect(
      countSkus([
        impact({ skuCode: 'SKU-1', region: 'WEST' }),
        impact({ skuCode: 'SKU-1', region: 'EAST' }),
        impact({ skuCode: 'SKU-2' }),
      ]),
    ).toBe(2)
  })
})

describe('buildAxisScale', () => {
  it('가장 이른 날짜를 0, 가장 늦은 날짜를 100에 놓는다', () => {
    const rows = [impact({ skuCode: 'SKU-1', safetyStockBreachDate: '2026-08-01' })]
    const { toPercent } = buildAxisScale(rows, shipment.plannedInbound, shipment.expectedInbound)
    expect(toPercent(shipment.plannedInbound)).toBe(0)
    expect(toPercent(shipment.expectedInbound)).toBe(100)
    expect(toPercent('2026-08-01')).toBeGreaterThan(0)
    expect(toPercent('2026-08-01')).toBeLessThan(100)
  })

  it('날짜가 하루뿐이어도 0으로 나누지 않는다', () => {
    const { toPercent, ticks } = buildAxisScale([], '2026-07-03', '2026-07-03')
    expect(toPercent('2026-07-03')).toBe(0)
    expect(ticks.length).toBeGreaterThan(0)
  })
})

describe('getInboundDelay / getAxisAlign', () => {
  it('예상 입고가 계획보다 늦으면 지연이다', () => {
    expect(getInboundDelay('2026-07-03', '2026-09-22')).toEqual({ isDelayed: true, delayDays: 81 })
    expect(getInboundDelay('2026-07-03', '2026-07-03')).toEqual({ isDelayed: false, delayDays: 0 })
  })

  it('축 양 끝의 글자는 안쪽으로 붙인다', () => {
    expect(getAxisAlign(0)).toBe('start')
    expect(getAxisAlign(50)).toBe('center')
    expect(getAxisAlign(100)).toBe('end')
  })
})

describe('buildAxisSummary', () => {
  it('선적의 입고 일정을 먼저 읽고, 실린 상품을 하나씩 읽는다', () => {
    const rows = [
      impact({
        skuCode: 'SKU-1',
        productName: 'A',
        safetyStockBreachDate: '2026-09-04',
        stockoutDate: '2026-09-19',
        stockoutDays: 3,
      }),
      impact({ skuCode: 'SKU-2', productName: 'B', safetyStockBreachDate: '2026-08-30' }),
    ]
    expect(buildAxisSummary(rows, shipment)).toBe(
      '선적 OCN-1: 계획 입고 07.03, 예상 입고 09.22(81일 지연). 실린 상품 2종 — A: 09.04 안전재고 하회, 09.19 재고 소진 / B: 08.30 안전재고 하회',
    )
  })

  it('지연이 없으면 지연 일수를 읽지 않는다', () => {
    const rows = [impact({ skuCode: 'SKU-1', productName: 'A', stockoutDate: '2026-07-01' })]
    expect(
      buildAxisSummary(rows, {
        ...shipment,
        skuCount: 1,
        expectedInbound: shipment.plannedInbound,
      }),
    ).toBe('선적 OCN-1: 계획 입고 07.03, 예상 입고 07.03. 실린 상품 1종 — A: 07.01 재고 소진')
  })

  it('일정판에 그린 상품이 선적의 전체보다 적으면 둘을 함께 읽는다', () => {
    const rows = [impact({ skuCode: 'SKU-1', productName: 'A', stockoutDate: '2026-07-01' })]
    expect(buildAxisSummary(rows, { ...shipment, skuCount: 8 })).toContain('실린 상품 8종 중 1종 —')
  })
})
