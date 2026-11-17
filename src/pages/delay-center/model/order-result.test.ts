import { describe, expect, it } from 'vitest'

import {
  type DelayOption,
  FEASIBILITY,
  getOrderResult,
  type OptionLineOutcome,
  OPTION_TYPE,
  ORDER_OUTCOME,
  RISK_ATTRIBUTION,
  type RiskOrder,
  sortOptions,
} from './delay-center'

const order = (lineIds: string[]): RiskOrder => ({
  orderCode: 'A-ORD-1',
  riskReason: '',
  attribution: RISK_ATTRIBUTION.DELAY_INDUCED,
  promisedDate: '2026-07-10',
  expectedDate: '2026-07-21',
  lines: lineIds.map((riskLineId, index) => ({
    riskLineId,
    lineNo: index + 1,
    skuCode: 'SKU-1',
    productName: '상품',
    openQuantity: 18,
  })),
})

const outcome = (
  riskLineId: string,
  code: string,
  expectedDate: string | null = '2026-07-09',
): OptionLineOutcome => ({
  riskLineId,
  outcome: code as OptionLineOutcome['outcome'],
  notRecoveredReason: code === ORDER_OUTCOME.NOT_RECOVERED ? 'NO_TRANSFERABLE_STOCK' : null,
  expectedDate,
})

const option = (outcomes: OptionLineOutcome[]) => ({ outcomes }) as DelayOption

describe('getOrderResult', () => {
  it('모든 품목이 회복이면 회복이고 배송일은 가장 늦은 품목 기준이다', () => {
    const result = getOrderResult(
      order(['l1', 'l2']),
      option([
        outcome('l1', ORDER_OUTCOME.RECOVERED, '2026-07-09'),
        outcome('l2', ORDER_OUTCOME.RECOVERED, '2026-07-11'),
      ]),
    )

    expect(result).toEqual({ kind: ORDER_OUTCOME.RECOVERED, expectedDate: '2026-07-11' })
  })

  it('품목 하나라도 회복하지 못하면 남은 위험이다', () => {
    const result = getOrderResult(
      order(['l1', 'l2']),
      option([outcome('l1', ORDER_OUTCOME.RECOVERED), outcome('l2', ORDER_OUTCOME.NOT_RECOVERED)]),
    )

    expect(result).toEqual({ kind: ORDER_OUTCOME.NOT_RECOVERED, reason: 'NO_TRANSFERABLE_STOCK' })
  })

  it('이 주문의 결과가 없으면 null이다', () => {
    expect(getOrderResult(order(['l1']), option([outcome('other', ORDER_OUTCOME.RECOVERED)]))).toBe(
      null,
    )
  })

  it('품목 일부의 결과만 있고 모두 회복이면 회복으로 보지 않는다', () => {
    const result = getOrderResult(
      order(['l1', 'l2']),
      option([outcome('l1', ORDER_OUTCOME.RECOVERED)]),
    )

    expect(result).toBe(null)
  })

  it('모르는 outcome 값이 있으면 회복으로 보지 않는다', () => {
    const result = getOrderResult(order(['l1']), option([outcome('l1', 'PARTIAL')]))

    expect(result).toBe(null)
  })
})

describe('sortOptions', () => {
  const item = (id: string, recommended: boolean, feasibility: DelayOption['feasibility']) =>
    ({ id, recommended, feasibility, type: OPTION_TYPE.KEEP_PLAN }) as DelayOption

  it('추천이 맨 앞, 그다음 실행 가능 → 확인 필요 → 실행 불가, 같으면 받은 순서를 지킨다', () => {
    const sorted = sortOptions([
      item('a', false, FEASIBILITY.NOT_FEASIBLE),
      item('b', false, FEASIBILITY.NEEDS_CHECK),
      item('c', false, FEASIBILITY.FEASIBLE),
      item('d', true, FEASIBILITY.FEASIBLE),
      item('e', false, FEASIBILITY.FEASIBLE),
    ])

    expect(sorted.map(({ id }) => id)).toEqual(['d', 'c', 'e', 'b', 'a'])
  })
})
