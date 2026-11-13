import { describe, expect, it } from 'vitest'

import type { AnalysisRunDetail, DelayEventDetail } from '@/shared/api'

import { toDelayCase } from './to-delay-case'

// 이 테스트가 보는 필드만 채운다. 나머지는 화면 모델로 바꾸는 데 쓰이지 않는다
const detail = {
  delayEventId: 'delay-1',
  shipment: { shipmentCode: 'OCN-1' },
  representativeSku: null,
  skuCount: 1,
  route: 'KR → LOS ANGELES',
  transportMode: 'OCEAN',
  delayDays: 2,
  stage: 'IN_TRANSIT',
  planned3plInboundDate: '2026-01-13',
  expected3plInboundDate: '2026-01-15',
  detectedAt: '2026-01-07T00:03:00Z',
  closedAt: null,
  runs: [],
} as unknown as DelayEventDetail

const explanation = {
  run_summary: '요약',
  risk_summary: '위험',
  recommendation_explanation: '추천 설명',
  warnings: [],
  option_explanations: [],
}

const option = (id: string, isRecommended: boolean) => ({
  responseOptionId: id,
  optionType: 'KEEP_PLAN',
  feasibilityStatus: 'FEASIBLE',
  reasonCode: null,
  securableQuantity: 0,
  expectedDeliveryDate: '2026-01-15',
  delayInducedRecoveredOrders: 0,
  notRecoveredOrders: 0,
  itemSecuredBlockedOrders: 0,
  isRecommended,
})

const run = (explanationValidationStatus: string | null) =>
  ({
    runId: 'run-1',
    runCode: 'AN-260107-001',
    status: 'READY_FOR_REVIEW',
    resultClass: 'READY_ORDER_RISK',
    inputBasis: { dataBasisAt: '2026-01-07T00:00:00Z', dataWarnings: [] },
    inventoryImpacts: [],
    atRiskOrders: [],
    responseOptions: [option('option-1', true), option('option-2', false)],
    drafts: [],
    finalDecision: null,
    failureCode: null,
    failureMessage: null,
    stalePrimaryReason: null,
    explanationValidationStatus,
    explanation: explanationValidationStatus === 'PASSED' ? explanation : null,
  }) as unknown as AnalysisRunDetail

const recommendedIds = (explanationValidationStatus: string | null) =>
  toDelayCase(detail, run(explanationValidationStatus))
    ?.analysis?.options.filter((item) => item.recommended)
    .map((item) => item.id)

describe('toDelayCase 추천 표시(명세 4.5)', () => {
  it('설명 검증을 통과한 실행은 서버가 추천으로 준 대응안을 추천으로 보인다', () => {
    expect(recommendedIds('PASSED')).toEqual(['option-1'])
  })

  it('설명 검증이 실패한 실행은 서버가 추천을 주어도 추천으로 보이지 않는다', () => {
    expect(recommendedIds('FAILED')).toEqual([])
  })

  it('설명 검증 결과가 없는 실행도 추천으로 보이지 않는다', () => {
    expect(recommendedIds(null)).toEqual([])
  })

  it('설명은 검증을 통과한 실행에서만 있다', () => {
    expect(toDelayCase(detail, run('PASSED'))?.analysis?.explanation?.recommendation).toBe(
      '추천 설명',
    )
    expect(toDelayCase(detail, run('FAILED'))?.analysis?.explanation).toBeNull()
  })
})
