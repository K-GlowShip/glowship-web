import type {
  AiExplanation,
  AnalysisRunSummary,
  DelayAnalysis,
  DelayCase,
  DelayOption,
  MemberOpinion,
  RiskOrder,
  RiskOrderLine,
  SkuImpact,
} from './delay-center'

// delay-center-mock.ts의 기본 케이스에 없는 조합을 채우는 더미 데이터.
// 상태 × 운송 수단·단계 × 결과 분류 × 대응안 판정 × 의견·선택·종료 × 데이터 누락을 한 번씩 보여 준다.
// TODO: GET /delay-events, GET /analysis-runs/{runId} 연동 후 서버 응답으로 교체

const MEMBER_1 = 'A Beauty Company Member 1'
const MEMBER_2 = 'A Beauty Company Member 2'
const LEAD = 'A Beauty Company Lead'

// 더미는 대응안 옆에 설명을 적어 두고, `toDelayCase`가 서버 모양(`explanation.optionExplanations`)으로 옮긴다.
export type MockOption = DelayOption & { explanation?: string | null }
type MockExplanation = Omit<AiExplanation, 'optionExplanations'>
export type MockAnalysis = Omit<DelayAnalysis, 'options' | 'explanation'> & {
  options: MockOption[]
  explanation: MockExplanation | null
}
export type MockDelayCase = Omit<DelayCase, 'analysis'> & { analysis: MockAnalysis | null }

/** AI 설명 생성에 실패한 분석(`explanation: null`)은 대응안별 설명도 없다. */
export const toDelayCase = ({ analysis, ...rest }: MockDelayCase): DelayCase => {
  if (!analysis) {
    return { ...rest, analysis: null }
  }
  const { options, explanation, ...analysisRest } = analysis
  return {
    ...rest,
    analysis: {
      ...analysisRest,
      options: options.map((item) => {
        const option: Partial<MockOption> = { ...item }
        delete option.explanation
        return option as DelayOption
      }),
      explanation: explanation && {
        ...explanation,
        optionExplanations: Object.fromEntries(
          options.flatMap(({ type, explanation: text }) => (text ? [[type, text]] : [])),
        ) as AiExplanation['optionExplanations'],
      },
    },
  }
}

const option = (
  id: string,
  type: DelayOption['type'],
  overrides: Partial<MockOption> = {},
): MockOption => ({
  id,
  type,
  feasibility: 'FEASIBLE',
  reasonCode: null,
  expectedArrival: null,
  securableQuantity: null,
  delayInducedRecoveredOrders: null,
  notRecoveredOrders: null,
  itemSecuredBlockedOrders: null,
  recommended: false,
  explanation: null,
  ...overrides,
})

/** 현재 계획 유지는 항상 실행 가능한 비교 기준선이다. */
const keepPlan = (notRecoveredOrders: number | null, expectedArrival = '2026-10-28') =>
  option('keep-plan', 'KEEP_PLAN', {
    expectedArrival,
    securableQuantity: 0,
    delayInducedRecoveredOrders: 0,
    notRecoveredOrders,
    explanation:
      notRecoveredOrders === 0
        ? '추가 대응 없이 예상 입고일을 기다립니다.'
        : `추가 대응 없이 예상 입고일을 기다리며, 위험 주문 ${notRecoveredOrders ?? 0}건이 그대로 남습니다.`,
  })

const impact = (
  skuCode: string,
  productName: string,
  region: SkuImpact['region'],
  scope: SkuImpact['scope'],
  overrides: Partial<SkuImpact> = {},
): SkuImpact => ({
  skuCode,
  productName,
  region,
  scope,
  estimable: true,
  increasedShortage: 0,
  safetyStockBreachDate: null,
  stockoutDate: null,
  stockoutDays: null,
  ...overrides,
})

const order = (
  orderCode: string,
  attribution: RiskOrder['attribution'],
  promisedDate: string,
  expectedDate: string,
  riskReason: string,
  lines: RiskOrderLine[],
): RiskOrder => ({ orderCode, riskReason, attribution, promisedDate, expectedDate, lines })

const explanation = (
  runSummary: string,
  riskSummary: string,
  recommendation: string,
  warnings: string[] = [],
): MockExplanation => ({ runSummary, riskSummary, recommendation, warnings })

const run = (
  versionNo: number,
  runCode: string | null,
  status: AnalysisRunSummary['status'],
  isLatest: boolean,
  startedAt: string,
  finishedAt: string | null,
): AnalysisRunSummary => ({ versionNo, runCode, status, isLatest, startedAt, finishedAt })

const analysis = (overrides: Partial<MockAnalysis>): MockAnalysis => ({
  resultClass: 'READY_ORDER_RISK',
  impacts: [],
  riskOrders: [],
  options: [],
  explanation: null,
  ...overrides,
})

const delayCase = (
  required: Pick<
    MockDelayCase,
    | 'id'
    | 'detectedAt'
    | 'shipmentCode'
    | 'status'
    | 'stage'
    | 'delayDays'
    | 'plannedInbound'
    | 'expectedInbound'
  > &
    Partial<MockDelayCase>,
): MockDelayCase => ({
  productName: 'A Glow Hydra Cream 50ml',
  skuCount: 1,
  runCode: null,
  route: 'KR → LOS ANGELES',
  transportMode: 'OCEAN',
  closedAt: null,
  baseDataAt: '2026-10-21T00:30:00Z',
  dataNotice: null,
  progressStep: null,
  failureMessage: null,
  staleReason: null,
  analysis: null,
  runs: [],
  opinions: [],
  finalDecision: null,
  ...required,
})

const opinion = (
  id: string,
  author: string,
  createdAt: string,
  optionId: string | null,
  text: string | null,
): MemberOpinion => ({ id, author, createdAt, optionId, text })

// ---- 1. 선택 대기: 많은 상품·위험 주문·의견이 있는 가장 복잡한 결과 ----
const MANY_OPTIONS = [
  option('pre-air', 'PRE_DEPARTURE_AIR', {
    expectedArrival: '2026-10-25',
    securableQuantity: 2100,
    delayInducedRecoveredOrders: 6,
    notRecoveredOrders: 1,
    recommended: true,
    explanation: '지연 유발 위험 주문 6건을 회복하고 1건이 남습니다.',
  }),
  option('other-region', 'OTHER_REGION_FULFILL', {
    expectedArrival: '2026-10-24',
    securableQuantity: 900,
    delayInducedRecoveredOrders: 3,
    notRecoveredOrders: 4,
    itemSecuredBlockedOrders: 1,
    explanation: '지연 유발 위험 주문 3건을 회복하고 4건이 남습니다.',
  }),
  keepPlan(7, '2026-10-30'),
]

const MANY_ORDERS: RiskOrder[] = [
  order(
    'A-ORD-20261016-0101',
    'DELAY_INDUCED',
    '2026-10-26',
    '2026-10-30',
    'SKU-101 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
    [
      { lineNo: 1, skuCode: 'SKU-101', openQuantity: 200 },
      { lineNo: 2, skuCode: 'SKU-102', openQuantity: 90 },
      { lineNo: 3, skuCode: 'SKU-103', openQuantity: 30 },
    ],
  ),
  order(
    'A-ORD-20261016-0102',
    'DELAY_INDUCED',
    '2026-10-26',
    '2026-10-30',
    'SKU-101 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
    [{ lineNo: 1, skuCode: 'SKU-101', openQuantity: 150 }],
  ),
  order(
    'A-ORD-20261017-0110',
    'DELAY_INDUCED',
    '2026-10-27',
    '2026-10-31',
    'SKU-102 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
    [{ lineNo: 1, skuCode: 'SKU-102', openQuantity: 120 }],
  ),
  order(
    'A-ORD-20261017-0118',
    'DELAY_INDUCED',
    '2026-10-27',
    '2026-10-31',
    'SKU-101 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
    [
      { lineNo: 1, skuCode: 'SKU-101', openQuantity: 80 },
      { lineNo: 2, skuCode: 'SKU-104', openQuantity: 40 },
    ],
  ),
  order(
    'A-ORD-20261018-0120',
    'DELAY_INDUCED',
    '2026-10-28',
    '2026-11-01',
    'SKU-103 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
    [{ lineNo: 1, skuCode: 'SKU-103', openQuantity: 60 }],
  ),
  order(
    'A-ORD-20261014-0090',
    'PRE_EXISTING',
    '2026-10-24',
    '2026-10-27',
    '계획 입고일 기준으로도 SKU-101 재고가 부족합니다.',
    [{ lineNo: 1, skuCode: 'SKU-101', openQuantity: 70 }],
  ),
  order(
    'A-ORD-20261014-0095',
    'PRE_EXISTING',
    '2026-10-25',
    '2026-10-28',
    '계획 입고일 기준으로도 SKU-104 재고가 부족합니다.',
    [{ lineNo: 1, skuCode: 'SKU-104', openQuantity: 55 }],
  ),
]

const MANY_SKU_CASE = delayCase({
  id: 'de-1013',
  detectedAt: '2026-10-20T03:00:00Z',
  shipmentCode: 'OCN-20260901',
  productName: 'A Glow Hydra Cream 50ml',
  skuCount: 5,
  status: 'READY_FOR_REVIEW',
  stage: 'PRE_DEPARTURE',
  delayDays: 4,
  plannedInbound: '2026-10-26',
  expectedInbound: '2026-10-30',
  runCode: 'AN-261021-051',
  dataNotice: 'TMS 수집이 지연되어 선적 정보가 오래되었을 수 있습니다.',
  runs: [
    run(
      3,
      'AN-261021-051',
      'READY_FOR_REVIEW',
      true,
      '2026-10-21T00:31:00Z',
      '2026-10-21T00:37:00Z',
    ),
    run(
      2,
      'AN-261020-044',
      'NEEDS_REANALYSIS',
      false,
      '2026-10-20T03:10:00Z',
      '2026-10-20T03:16:00Z',
    ),
    run(
      1,
      'AN-261019-030',
      'NEEDS_REANALYSIS',
      false,
      '2026-10-19T01:00:00Z',
      '2026-10-19T01:06:00Z',
    ),
  ],
  analysis: analysis({
    impacts: [
      impact('SKU-101', 'A Glow Hydra Cream 50ml', 'WEST', 'IMPACTED', {
        increasedShortage: 2100,
        safetyStockBreachDate: '2026-10-22',
        stockoutDate: '2026-10-24',
        stockoutDays: 7,
      }),
      impact('SKU-102', 'A Glow Hydra Toner 150ml', 'WEST', 'IMPACTED', {
        increasedShortage: 640,
        safetyStockBreachDate: '2026-10-23',
        stockoutDate: '2026-10-27',
        stockoutDays: 4,
      }),
      impact('SKU-103', 'A Glow Calming Serum 30ml', 'EAST', 'IMPACTED', {
        estimable: false,
        increasedShortage: null,
        safetyStockBreachDate: null,
        stockoutDate: null,
        stockoutDays: null,
      }),
      impact('SKU-104', 'A Glow Mask Pack 5ea', 'KR', 'WATCH', {
        safetyStockBreachDate: '2026-10-29',
      }),
      // 지연 선적에만 있는 SKU라 화면에는 나오지 않는다
      impact('SKU-105', 'A Glow Lip Balm 10g', 'WEST', 'SHIPMENT_ONLY'),
    ],
    riskOrders: MANY_ORDERS,
    options: MANY_OPTIONS,
    explanation: explanation(
      '선적 OCN-20260901의 3PL 입고가 10월 26일에서 10월 30일로 4일 밀렸고, 실주문 납기 위험이 있습니다.',
      '5개 상품 중 2개 상품의 부족이 지연으로 2,740개 늘고 위험 주문은 7건입니다. 예측 기준 값입니다.',
      '출항 전 항공 전환이 지연 유발 위험 주문을 가장 많이 회복해 1순위입니다.',
      ['판매 기준 기간과 행사 기간이 겹칩니다.', '판정할 수 없는 상품이 있습니다.'],
    ),
  }),
  opinions: [
    opinion(
      'op-m1',
      MEMBER_1,
      '2026-10-21T00:50:00Z',
      'pre-air',
      '출항 전이라 항공 전환이 가능한지 포워더에 확인했고 가능하다고 합니다.',
    ),
    opinion('op-m2', MEMBER_2, '2026-10-21T01:15:00Z', 'other-region', null),
    opinion(
      'op-m3',
      MEMBER_1,
      '2026-10-21T01:40:00Z',
      null,
      '두 안을 섞어서 쓸 수 있는지도 같이 검토해 주세요.',
    ),
  ],
})

// ---- 2. 선택 대기: 해상, 항구 도착 후. 한국 창고 항공 보충이 불가 ----
const PORT_CASE = delayCase({
  id: 'de-1012',
  detectedAt: '2026-10-20T01:00:00Z',
  shipmentCode: 'OCN-20260902',
  productName: 'A Glow Calming Toner 150ml',
  status: 'READY_FOR_REVIEW',
  stage: 'AT_PORT',
  route: 'KR → NEWARK',
  delayDays: 3,
  plannedInbound: '2026-10-25',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-049',
  runs: [
    run(
      1,
      'AN-261021-049',
      'READY_FOR_REVIEW',
      true,
      '2026-10-21T00:32:00Z',
      '2026-10-21T00:36:00Z',
    ),
  ],
  analysis: analysis({
    impacts: [
      impact('SKU-201', 'A Glow Calming Toner 150ml', 'EAST', 'IMPACTED', {
        increasedShortage: 380,
        safetyStockBreachDate: '2026-10-25',
        stockoutDate: '2026-10-27',
        stockoutDays: 3,
      }),
    ],
    riskOrders: [
      order(
        'A-ORD-20261018-0201',
        'DELAY_INDUCED',
        '2026-10-27',
        '2026-10-30',
        'SKU-201 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
        [{ lineNo: 1, skuCode: 'SKU-201', openQuantity: 110 }],
      ),
      order(
        'A-ORD-20261018-0204',
        'DELAY_INDUCED',
        '2026-10-27',
        '2026-10-30',
        'SKU-201 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
        [{ lineNo: 1, skuCode: 'SKU-201', openQuantity: 90 }],
      ),
    ],
    options: [
      option('kr-air', 'KR_AIR_REPLENISH', {
        feasibility: 'NOT_FEASIBLE',
        reasonCode: 'NO_KR_ELIGIBLE_STOCK',
        securableQuantity: 0,
        delayInducedRecoveredOrders: 0,
        notRecoveredOrders: 2,
        explanation: '한국 창고에 보충할 재고가 없습니다.',
      }),
      option('other-region', 'OTHER_REGION_FULFILL', {
        expectedArrival: '2026-10-26',
        securableQuantity: 380,
        delayInducedRecoveredOrders: 2,
        notRecoveredOrders: 0,
        recommended: true,
        explanation: '지연 유발 위험 주문 2건을 모두 회복합니다.',
      }),
      keepPlan(2),
    ],
    explanation: explanation(
      '선적 OCN-20260902의 3PL 입고가 10월 25일에서 10월 28일로 3일 밀렸고, 실주문 납기 위험이 있습니다.',
      'A Glow Calming Toner 150ml의 부족이 지연으로 380개 늘고 위험 주문은 2건입니다. 예측 기준 값입니다.',
      '다른 권역 창고 출고가 위험 주문을 모두 회복해 1순위입니다.',
    ),
  }),
})

// ---- 3. 선택 대기: 항공 출항 전. 계획 유지 말고는 실행 가능한 대응안이 없고 추천도 없음 ----
const AIR_NO_OPTION_CASE = delayCase({
  id: 'de-1011',
  detectedAt: '2026-10-19T23:00:00Z',
  shipmentCode: 'AIR-REG-20261010',
  productName: 'A Glow Hydra Mist 100ml',
  status: 'READY_FOR_REVIEW',
  transportMode: 'AIR',
  stage: 'PRE_DEPARTURE',
  delayDays: 2,
  plannedInbound: '2026-10-26',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-047',
  runs: [
    run(
      1,
      'AN-261021-047',
      'READY_FOR_REVIEW',
      true,
      '2026-10-21T00:33:00Z',
      '2026-10-21T00:38:00Z',
    ),
  ],
  analysis: analysis({
    impacts: [
      impact('SKU-301', 'A Glow Hydra Mist 100ml', 'WEST', 'IMPACTED', {
        increasedShortage: 150,
        safetyStockBreachDate: '2026-10-26',
        stockoutDate: '2026-10-28',
        stockoutDays: 2,
      }),
    ],
    riskOrders: [
      order(
        'A-ORD-20261019-0301',
        'DELAY_INDUCED',
        '2026-10-27',
        '2026-10-29',
        'SKU-301 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
        [{ lineNo: 1, skuCode: 'SKU-301', openQuantity: 75 }],
      ),
    ],
    options: [
      option('kr-air', 'KR_AIR_REPLENISH', {
        feasibility: 'NOT_FEASIBLE',
        reasonCode: 'ARRIVES_AFTER_DELAYED_SHIPMENT',
        securableQuantity: 0,
        delayInducedRecoveredOrders: 0,
        notRecoveredOrders: 1,
        explanation: '지연된 선적보다 늦게 도착해 효과가 없습니다.',
      }),
      option('other-region', 'OTHER_REGION_FULFILL', {
        feasibility: 'NOT_FEASIBLE',
        reasonCode: 'NO_RECOVERY_EFFECT',
        securableQuantity: 0,
        delayInducedRecoveredOrders: 0,
        notRecoveredOrders: 1,
        explanation: '이 대응안으로는 회복되는 주문이 없습니다.',
      }),
      keepPlan(1),
    ],
    explanation: explanation(
      '선적 AIR-REG-20261010의 3PL 입고가 10월 26일에서 10월 28일로 2일 밀렸고, 실주문 납기 위험이 있습니다.',
      'A Glow Hydra Mist 100ml의 부족이 지연으로 150개 늘고 위험 주문은 1건입니다. 예측 기준 값입니다.',
      '실행 가능한 대응안이 없어 추천하지 않습니다.',
    ),
  }),
})

// ---- 4. 선택 대기: 항공 운송 중, 예측 부족만 있고 필수 자료가 없는 대응안 ----
const AIR_FORECAST_CASE = delayCase({
  id: 'de-1010',
  detectedAt: '2026-10-19T21:00:00Z',
  shipmentCode: 'AIR-REG-20261011',
  productName: 'A Glow Hydra Serum 30ml',
  skuCount: 2,
  status: 'READY_FOR_REVIEW',
  transportMode: 'AIR',
  stage: 'IN_AIR',
  delayDays: 1,
  plannedInbound: '2026-10-27',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-046',
  runs: [
    run(
      1,
      'AN-261021-046',
      'READY_FOR_REVIEW',
      true,
      '2026-10-21T00:34:00Z',
      '2026-10-21T00:39:00Z',
    ),
  ],
  analysis: analysis({
    resultClass: 'FORECAST_ONLY_READY',
    impacts: [
      impact('SKU-401', 'A Glow Hydra Serum 30ml', 'WEST', 'IMPACTED', {
        increasedShortage: 240,
        safetyStockBreachDate: '2026-10-27',
      }),
      impact('SKU-402', 'A Glow Hydra Serum 15ml', 'WEST', 'IMPACTED', {
        increasedShortage: 90,
        safetyStockBreachDate: '2026-10-28',
      }),
    ],
    options: [
      option('other-region', 'OTHER_REGION_FULFILL', {
        expectedArrival: '2026-10-26',
        securableQuantity: 330,
        delayInducedRecoveredOrders: 0,
        notRecoveredOrders: 0,
        recommended: true,
        explanation: '위험 주문은 없지만 예측 부족 330개를 줄일 수 있습니다.',
      }),
      option('kr-air', 'KR_AIR_REPLENISH', {
        feasibility: 'NEEDS_CHECK',
        reasonCode: 'MISSING_REQUIRED_DATA',
        explanation: '필수 자료가 없어 판정할 수 없습니다.',
      }),
      keepPlan(0),
    ],
    explanation: explanation(
      '선적 AIR-REG-20261011의 3PL 입고가 10월 27일에서 10월 28일로 1일 밀렸습니다.',
      '실제 지연 유발 위험 주문은 없고 2개 상품에서 지연 증분 예측 부족이 있습니다. 예측 기준 값입니다.',
      '다른 권역 창고 출고가 예측 부족을 가장 많이 줄여 1순위입니다.',
      ['판매 기준 기간과 행사 기간이 겹칩니다.', '확인이 필요한 대응안이 있습니다.'],
    ),
  }),
  opinions: [
    opinion(
      'op-m4',
      MEMBER_2,
      '2026-10-21T01:20:00Z',
      'kr-air',
      '항공 보충 물량은 한국 창고 재고로 충당 가능해 보입니다.',
    ),
  ],
})

// ---- 5. 선택 대기: 해상 운송 중. 효과 1개 미만, 공여 창고 다음 입고 없음 ----
const AT_SEA_CASE = delayCase({
  id: 'de-1009',
  detectedAt: '2026-10-19T19:00:00Z',
  shipmentCode: 'OCN-20260903',
  productName: 'A Glow Cleansing Oil 200ml',
  status: 'READY_FOR_REVIEW',
  stage: 'AT_SEA',
  delayDays: 2,
  plannedInbound: '2026-10-26',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-045',
  runs: [
    run(
      1,
      'AN-261021-045',
      'READY_FOR_REVIEW',
      true,
      '2026-10-21T00:35:00Z',
      '2026-10-21T00:40:00Z',
    ),
  ],
  analysis: analysis({
    impacts: [
      impact('SKU-501', 'A Glow Cleansing Oil 200ml', 'WEST', 'IMPACTED', {
        increasedShortage: 60,
        safetyStockBreachDate: '2026-10-26',
        stockoutDate: '2026-10-28',
        stockoutDays: 2,
      }),
    ],
    riskOrders: [
      order(
        'A-ORD-20261019-0501',
        'DELAY_INDUCED',
        '2026-10-27',
        '2026-10-29',
        'SKU-501 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
        [{ lineNo: 1, skuCode: 'SKU-501', openQuantity: 30 }],
      ),
      order(
        'A-ORD-20261016-0488',
        'PRE_EXISTING',
        '2026-10-25',
        '2026-10-27',
        '계획 입고일 기준으로도 SKU-501 재고가 부족합니다.',
        [{ lineNo: 1, skuCode: 'SKU-501', openQuantity: 20 }],
      ),
    ],
    options: [
      option('kr-air', 'KR_AIR_REPLENISH', {
        feasibility: 'NOT_FEASIBLE',
        reasonCode: 'FORECAST_EFFECT_BELOW_ONE_UNIT',
        securableQuantity: 0,
        delayInducedRecoveredOrders: 0,
        notRecoveredOrders: 1,
        explanation: '효과가 1개 미만이라 실행할 수 없습니다.',
      }),
      option('other-region', 'OTHER_REGION_FULFILL', {
        feasibility: 'NEEDS_CHECK',
        reasonCode: 'DONOR_NO_NEXT_INBOUND',
        explanation: '공여 창고의 다음 입고가 없어 판정할 수 없습니다.',
      }),
      keepPlan(1),
    ],
    explanation: explanation(
      '선적 OCN-20260903의 3PL 입고가 10월 26일에서 10월 28일로 2일 밀렸고, 실주문 납기 위험이 있습니다.',
      'A Glow Cleansing Oil 200ml의 부족이 지연으로 60개 늘고 위험 주문은 2건입니다. 예측 기준 값입니다.',
      '실행 가능한 대응안이 없어 추천하지 않습니다.',
      ['확인이 필요한 대응안이 있습니다.'],
    ),
  }),
})

// ---- 6. 재분석 필요: AI 설명 생성 실패(계산 결과는 있음) ----
const EXPLANATION_FAILED_CASE = delayCase({
  id: 'de-1008',
  detectedAt: '2026-10-19T17:00:00Z',
  shipmentCode: 'OCN-20260904',
  productName: 'A Glow Hydra Lotion 120ml',
  status: 'NEEDS_REANALYSIS',
  stage: 'AT_SEA',
  delayDays: 3,
  plannedInbound: '2026-10-25',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-043',
  failureMessage: '설명을 만들지 못해 이 분석은 선택할 수 없습니다. 재분석이 필요합니다.',
  runs: [
    run(
      1,
      'AN-261021-043',
      'NEEDS_REANALYSIS',
      true,
      '2026-10-21T00:36:00Z',
      '2026-10-21T00:44:00Z',
    ),
  ],
  analysis: analysis({
    impacts: [
      impact('SKU-601', 'A Glow Hydra Lotion 120ml', 'WEST', 'IMPACTED', {
        increasedShortage: 500,
        safetyStockBreachDate: '2026-10-25',
        stockoutDate: '2026-10-27',
        stockoutDays: 3,
      }),
    ],
    riskOrders: [
      order(
        'A-ORD-20261019-0601',
        'DELAY_INDUCED',
        '2026-10-27',
        '2026-10-30',
        'SKU-601 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
        [{ lineNo: 1, skuCode: 'SKU-601', openQuantity: 100 }],
      ),
    ],
    options: [
      option('kr-air', 'KR_AIR_REPLENISH', {
        expectedArrival: '2026-10-25',
        securableQuantity: 500,
        delayInducedRecoveredOrders: 1,
        notRecoveredOrders: 0,
      }),
      option('other-region', 'OTHER_REGION_FULFILL', {
        feasibility: 'NOT_FEASIBLE',
        reasonCode: 'NO_TRANSFERABLE_STOCK',
        securableQuantity: 0,
        delayInducedRecoveredOrders: 0,
        notRecoveredOrders: 1,
      }),
      keepPlan(1),
    ],
    // 설명 검증을 통과하지 못했다
    explanation: null,
  }),
})

// ---- 7. 재분석 필요: 도구 실패(결과 없음) ----
const TOOL_FAILED_CASE = delayCase({
  id: 'de-1007',
  detectedAt: '2026-10-19T15:00:00Z',
  shipmentCode: 'AIR-REG-20261012',
  productName: 'A Glow Sun Cream 50ml',
  status: 'NEEDS_REANALYSIS',
  transportMode: 'AIR',
  stage: 'IN_AIR',
  delayDays: 2,
  plannedInbound: '2026-10-26',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-041',
  failureMessage: '분석 도구가 시간 안에 응답하지 않았습니다. 재시도를 모두 사용했습니다.',
  runs: [
    run(
      1,
      'AN-261021-041',
      'NEEDS_REANALYSIS',
      true,
      '2026-10-21T00:37:00Z',
      '2026-10-21T00:52:00Z',
    ),
  ],
})

// ---- 8. 분석 보류: 보류 사유 문구가 없는 경우 ----
const ON_HOLD_DEFAULT_CASE = delayCase({
  id: 'de-1006',
  detectedAt: '2026-10-19T13:00:00Z',
  shipmentCode: 'OCN-20260905',
  productName: 'A Glow Body Wash 300ml',
  status: 'ON_HOLD',
  stage: 'PRE_DEPARTURE',
  delayDays: 2,
  plannedInbound: '2026-10-26',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-040',
  runs: [run(1, 'AN-261021-040', 'ON_HOLD', true, '2026-10-21T00:38:00Z', '2026-10-21T00:39:00Z')],
})

// ---- 9. 분석 중: 선적 상세·실행 ID·기준 시각이 아직 없는 갓 감지된 지연 ----
const JUST_DETECTED_CASE = delayCase({
  id: 'de-1005',
  detectedAt: '2026-10-19T11:00:00Z',
  shipmentCode: 'AIR-REG-20261013',
  productName: null,
  skuCount: 0,
  status: 'ANALYZING',
  transportMode: 'AIR',
  stage: 'PRE_DEPARTURE',
  delayDays: 1,
  plannedInbound: '2026-10-27',
  expectedInbound: '2026-10-28',
  baseDataAt: null,
  runs: [run(1, null, 'ANALYZING', true, '2026-10-21T01:00:00Z', null)],
})

// ---- 10. 분석 중: 재분석을 요청해 새 버전이 진행 중. 이전 버전은 남아 있음 ----
const REANALYZING_CASE = delayCase({
  id: 'de-1004',
  detectedAt: '2026-10-19T09:00:00Z',
  shipmentCode: 'OCN-20260906',
  productName: 'A Glow Hydra Eye Cream 30ml',
  status: 'ANALYZING',
  stage: 'AT_PORT',
  delayDays: 2,
  plannedInbound: '2026-10-26',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-052',
  progressStep: '재고 영향 분석 중',
  runs: [
    run(2, 'AN-261021-052', 'ANALYZING', true, '2026-10-21T01:10:00Z', null),
    run(1, 'AN-261020-040', 'ON_HOLD', false, '2026-10-20T02:00:00Z', '2026-10-20T02:02:00Z'),
  ],
})

// ---- 11~13. 선택 완료 ----
const FINALIZED_OPTIONS = [
  option('kr-air', 'KR_AIR_REPLENISH', {
    expectedArrival: '2026-10-24',
    securableQuantity: 700,
    delayInducedRecoveredOrders: 5,
    notRecoveredOrders: 0,
    recommended: true,
    explanation: '지연 유발 위험 주문 5건을 모두 회복합니다.',
  }),
  option('other-region', 'OTHER_REGION_FULFILL', {
    expectedArrival: '2026-10-25',
    securableQuantity: 300,
    delayInducedRecoveredOrders: 2,
    notRecoveredOrders: 3,
    itemSecuredBlockedOrders: 1,
    explanation: '지연 유발 위험 주문 2건을 회복하고 3건이 남습니다.',
  }),
  keepPlan(5),
]

const FINALIZED_ANALYSIS = analysis({
  impacts: [
    impact('SKU-701', 'A Glow Hydra Cream 50ml', 'WEST', 'IMPACTED', {
      increasedShortage: 700,
      safetyStockBreachDate: '2026-10-22',
      stockoutDate: '2026-10-24',
      stockoutDays: 4,
    }),
  ],
  riskOrders: [
    order(
      'A-ORD-20261015-0701',
      'DELAY_INDUCED',
      '2026-10-25',
      '2026-10-28',
      'SKU-701 재고가 소진되어 약속일 안에 출고할 수 없습니다.',
      [{ lineNo: 1, skuCode: 'SKU-701', openQuantity: 140 }],
    ),
  ],
  options: FINALIZED_OPTIONS,
  explanation: explanation(
    '선적 OCN-20260907의 3PL 입고가 10월 24일에서 10월 28일로 4일 밀렸고, 실주문 납기 위험이 있습니다.',
    'A Glow Hydra Cream 50ml의 부족이 지연으로 700개 늘고 위험 주문은 5건입니다. 예측 기준 값입니다.',
    '한국 창고 항공 보충이 지연 유발 위험 주문을 가장 많이 회복해 1순위입니다.',
  ),
})

// 다른 권역 창고 출고가 1순위인 결과. 한국 창고 항공 보충은 회복하는 주문이 더 적다
const FINALIZED_OTHER_FIRST_ANALYSIS: MockAnalysis = {
  ...FINALIZED_ANALYSIS,
  options: [
    option('other-region', 'OTHER_REGION_FULFILL', {
      expectedArrival: '2026-10-24',
      securableQuantity: 700,
      delayInducedRecoveredOrders: 5,
      notRecoveredOrders: 0,
      recommended: true,
      explanation: '지연 유발 위험 주문 5건을 모두 회복합니다.',
    }),
    option('kr-air', 'KR_AIR_REPLENISH', {
      expectedArrival: '2026-10-25',
      securableQuantity: 300,
      delayInducedRecoveredOrders: 2,
      notRecoveredOrders: 3,
      itemSecuredBlockedOrders: 1,
      explanation: '지연 유발 위험 주문 2건을 회복하고 3건이 남습니다.',
    }),
    keepPlan(5),
  ],
  explanation: explanation(
    '선적 OCN-20260909의 3PL 입고가 10월 19일에서 10월 21일로 2일 밀렸고, 실주문 납기 위험이 있습니다.',
    'A Glow Hydra Cream 50ml의 부족이 지연으로 700개 늘고 위험 주문은 5건입니다. 예측 기준 값입니다.',
    '다른 권역 창고 출고가 지연 유발 위험 주문을 가장 많이 회복해 1순위입니다.',
  ),
}

// 팀장이 현재 계획 유지를 선택하고, 이유에 실제 조치를 적은 경우
const FINALIZED_KEEP_CASE = delayCase({
  id: 'de-1003',
  detectedAt: '2026-10-19T01:00:00Z',
  shipmentCode: 'OCN-20260907',
  productName: 'A Glow Hydra Cream 50ml',
  status: 'FINALIZED',
  stage: 'AT_SEA',
  delayDays: 4,
  plannedInbound: '2026-10-24',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261019-033',
  runs: [
    run(1, 'AN-261019-033', 'FINALIZED', true, '2026-10-19T01:00:00Z', '2026-10-19T01:08:00Z'),
  ],
  analysis: FINALIZED_ANALYSIS,
  opinions: [
    opinion(
      'op-m5',
      MEMBER_1,
      '2026-10-19T02:10:00Z',
      'kr-air',
      '항공 보충이 가장 효과적이지만 운임 협의가 필요합니다.',
    ),
  ],
  finalDecision: {
    author: LEAD,
    decidedAt: '2026-10-19T05:30:00Z',
    optionId: 'keep-plan',
    reason:
      '현재 계획을 유지합니다. 항공 운임이 부담되어 포워더와 별도로 일부 물량만 직접 수배하기로 했습니다.',
  },
})

// 입고까지 끝나 종료된 선적. 추천이 아닌 대응안을 선택했다
const FINALIZED_CLOSED_CASE = delayCase({
  id: 'de-1002',
  detectedAt: '2026-10-15T01:00:00Z',
  shipmentCode: 'OCN-20260908',
  productName: 'A Glow Calming Cream 50ml',
  skuCount: 2,
  status: 'FINALIZED',
  stage: 'RECEIVED',
  delayDays: 3,
  plannedInbound: '2026-10-20',
  expectedInbound: '2026-10-23',
  closedAt: '2026-10-23T04:00:00Z',
  runCode: 'AN-261016-020',
  runs: [
    run(2, 'AN-261016-020', 'FINALIZED', true, '2026-10-16T02:00:00Z', '2026-10-16T02:07:00Z'),
    run(
      1,
      'AN-261015-012',
      'NEEDS_REANALYSIS',
      false,
      '2026-10-15T01:00:00Z',
      '2026-10-15T01:06:00Z',
    ),
  ],
  analysis: FINALIZED_ANALYSIS,
  opinions: [
    opinion(
      'op-m6',
      MEMBER_1,
      '2026-10-16T03:00:00Z',
      'other-region',
      '창고 담당자가 가능 수량을 확인해 주었습니다.',
    ),
    opinion('op-m7', MEMBER_2, '2026-10-16T03:20:00Z', 'kr-air', null),
  ],
  finalDecision: {
    author: LEAD,
    decidedAt: '2026-10-16T06:00:00Z',
    optionId: 'other-region',
    reason:
      '운임 부담이 없고 약속일 안에 대부분 회복할 수 있어 다른 권역 창고 출고로 결정했습니다.',
  },
})

// ---- 14. 선택 대기였는데 최종 선택 없이 지연이 종료됨 ----
const CLOSED_WITHOUT_DECISION_CASE = delayCase({
  id: 'de-1001',
  detectedAt: '2026-10-17T01:00:00Z',
  shipmentCode: 'OCN-20260921',
  productName: 'A Glow Hydra Mask Pack 5ea',
  status: 'READY_FOR_REVIEW',
  stage: 'RECEIVED',
  delayDays: 2,
  plannedInbound: '2026-10-19',
  expectedInbound: '2026-10-21',
  closedAt: '2026-10-21T03:00:00Z',
  baseDataAt: '2026-10-19T00:30:00Z',
  runCode: 'AN-261017-014',
  runs: [
    run(
      1,
      'AN-261017-014',
      'READY_FOR_REVIEW',
      true,
      '2026-10-17T01:00:00Z',
      '2026-10-17T01:06:00Z',
    ),
  ],
  analysis: FINALIZED_OTHER_FIRST_ANALYSIS,
  opinions: [
    opinion(
      'op-m8',
      MEMBER_2,
      '2026-10-17T02:00:00Z',
      null,
      '위험 주문이 많지 않아 지켜봐도 될 것 같습니다.',
    ),
  ],
})

// ---- 15. 위험 없음: 지연 영향이 없고 보여 줄 재고 영향 행도 없음 ----
const PURE_NO_RISK_CASE = delayCase({
  id: 'de-1000',
  detectedAt: '2026-10-19T01:00:00Z',
  shipmentCode: 'OCN-20260922',
  productName: 'A Glow Lip Balm 10g',
  status: 'NO_RISK',
  stage: 'AT_SEA',
  delayDays: 1,
  plannedInbound: '2026-10-27',
  expectedInbound: '2026-10-28',
  runCode: 'AN-261021-038',
  runs: [run(1, 'AN-261021-038', 'NO_RISK', true, '2026-10-21T00:40:00Z', '2026-10-21T00:43:00Z')],
  analysis: analysis({
    resultClass: 'PURE_NO_RISK',
    impacts: [impact('SKU-801', 'A Glow Lip Balm 10g', 'WEST', 'SHIPMENT_ONLY')],
  }),
})

// ---- 16. 지연 해소: 최종 선택이 이미 있었던 건 ----
const RECOVERED_AFTER_DECISION_CASE = delayCase({
  id: 'de-0999',
  detectedAt: '2026-10-18T01:00:00Z',
  shipmentCode: 'OCN-20260923',
  productName: 'A Glow Hydra Toner Pad 60ea',
  status: 'NO_DELAY',
  stage: 'AT_SEA',
  delayDays: 0,
  plannedInbound: '2026-10-27',
  expectedInbound: '2026-10-26',
  closedAt: '2026-10-21T00:40:00Z',
  runCode: 'AN-261021-037',
  runs: [
    run(2, 'AN-261021-037', 'NO_DELAY', true, '2026-10-21T00:40:00Z', '2026-10-21T00:41:00Z'),
    run(1, 'AN-261018-025', 'FINALIZED', false, '2026-10-18T01:00:00Z', '2026-10-18T01:07:00Z'),
  ],
  finalDecision: {
    author: LEAD,
    decidedAt: '2026-10-18T05:00:00Z',
    optionId: 'kr-air',
    reason: '위험 주문을 모두 회복할 수 있는 한국 창고 항공 보충으로 결정했습니다.',
  },
})

export const MORE_DELAY_CASES: MockDelayCase[] = [
  MANY_SKU_CASE,
  PORT_CASE,
  AIR_NO_OPTION_CASE,
  AIR_FORECAST_CASE,
  AT_SEA_CASE,
  EXPLANATION_FAILED_CASE,
  TOOL_FAILED_CASE,
  ON_HOLD_DEFAULT_CASE,
  JUST_DETECTED_CASE,
  REANALYZING_CASE,
  FINALIZED_KEEP_CASE,
  FINALIZED_CLOSED_CASE,
  CLOSED_WITHOUT_DECISION_CASE,
  PURE_NO_RISK_CASE,
  RECOVERED_AFTER_DECISION_CASE,
]
