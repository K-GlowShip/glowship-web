import { RESULT_CLASS, type ResultClass } from './delay-center-code'

// AI 설명 카드의 쉬운 문장에 쓰는 말. 말이 어색하면 이 파일만 고친다. 문장 속 숫자는 모두 서버 값이다.
// 말투는 "~해요"체이고, 선적·SKU 코드 뒤에는 읽는 법에 따라 달라지는 조사(이/가, 은/는)를 붙이지 않는다.

/** 결과 분류별 분석 요약의 뒷 문장 */
export const RESULT_CLASS_SENTENCE: Record<ResultClass, string> = {
  [RESULT_CLASS.READY_ORDER_RISK]: '이미 받은 주문 중 일부가 납기를 못 맞출 수 있어요.',
  [RESULT_CLASS.FORECAST_ONLY_READY]:
    '이미 받은 주문은 괜찮지만, 앞으로 판매할 재고가 부족할 수 있어요.',
  [RESULT_CLASS.PURE_NO_RISK]: '지연돼도 재고와 주문에 영향이 없어요.',
  [RESULT_CLASS.WARNING_NO_RISK]: '지연 영향은 없지만, 원래부터 부족한 재고가 있어요.',
}

export const PLAIN_TEXT = {
  runDelayed: (shipmentCode: string, delayDays: number, planned: string, expected: string) =>
    `선적 ${shipmentCode}의 입고가 계획보다 ${delayDays}일 늦어질 것으로 예상돼요(계획 ${planned} → 예상 ${expected}).`,
  runOnTime: (shipmentCode: string, planned: string, expected: string) =>
    `선적 ${shipmentCode}의 입고는 계획대로 예상돼요(계획 ${planned} → 예상 ${expected}).`,

  /** 원래 부족이 0이면 괄호를 뺀다 */
  shortageDetail: (baseline: number | null, shortage: number | null) =>
    baseline !== null && baseline > 0 && shortage !== null
      ? `(원래 부족 ${baseline}개 → 지연 반영 ${shortage}개)`
      : '',
  impactOne: (skuCode: string, increased: string, detail: string) =>
    `${skuCode} 재고가 지연 때문에 ${increased}개 더 부족해질 것으로 예상돼요${detail}.`,
  impactMany: (count: string, list: string) =>
    `지연 때문에 SKU ${count}개가 추가로 부족해질 것으로 예상돼요 — ${list}.`,
  impactListItem: (skuCode: string, increased: string, detail: string) =>
    `${skuCode} ${increased}개${detail}`,
  impactListMore: (rest: string) => `외 ${rest}개`,
  delayInducedOrders: (count: string) =>
    `지연 때문에 납기를 못 맞출 수 있는 주문은 ${count}건이에요.`,
  preExistingOrders: (count: string, alsoDelayInduced: boolean) =>
    alsoDelayInduced
      ? `지연과 상관없이 원래 늦던 주문도 ${count}건 있어요.`
      : `지연과 상관없이 원래 늦던 주문이 ${count}건 있어요.`,

  // 아래 대응안 문장의 name에는 조사까지 붙은 이름(예: '현재 계획 유지는')이 들어온다
  keepPlanNoStock: (name: string) => `${name} 추가로 확보하는 재고가 없어요.`,
  keepPlanRisk: (count: string) => `위험 주문 ${count}건은 그대로 남아요.`,
  optionCannot: (name: string) => `${name} 실행할 수 없어요.`,
  optionNeedsCheck: (name: string) => `${name} 확인이 필요해요.`,
  optionFeasible: (name: string) => `${name} 실행할 수 있어요.`,
  optionRecovers: (name: string, total: string, recovered: string) =>
    `${name} 실행할 수 있고 위험 주문 ${total}건 중 ${recovered}건을 회복해요.`,
  optionRecoversNone: (name: string) => `${name} 실행할 수 있지만 회복되는 위험 주문은 없어요.`,
  leftoverAfterRecovery: (count: string) => `주문 회복 후 남는 커버 수량은 ${count}개예요.`,
  leftoverOnly: (count: string) => `남는 커버 수량은 ${count}개예요.`,

  recommendedRank: '실행할 수 있는 대응안 중 추천 순위가 1위예요.',
  recommendedMostRecovered: (total: string, recovered: string) =>
    `실행할 수 있는 대응안 중 위험 주문을 가장 많이 회복해요(${total}건 중 ${recovered}건). 그래서 추천 순위 1위예요.`,
  /** 위험 주문 회복 수가 같을 때(sameRecovered)는 그 점을 먼저 말한다. 위험 주문이 없으면 말하지 않는다 */
  recommendedMostReduced: (count: string, sameRecovered: boolean) =>
    `${sameRecovered ? '위험 주문 회복 수는 같지만, ' : ''}실행할 수 있는 대응안 중 재고 부족을 가장 많이 줄일 수 있어서(${count}개) 추천 순위 1위예요.`,
  recommendedKeepPlan: '실행할 수 있는 다른 대응안이 없어서 현재 계획 유지를 추천해요.',

  /** SKU 코드 뒤에는 조사를 붙이지 않으려고 '재고는'을 붙여 쓴다 */
  warningBaselineShortage: (skuList: string) =>
    `${skuList} 재고는 지연이 없어도 부족할 것으로 예상돼요.`,
  warningForecastEventOverlap:
    '판매 기준 기간에 행사 기간이 겹쳐 예상 판매량이 평소와 다를 수 있어요.',
  warningOptionNeedsCheck: (count: string) => `확인이 필요한 대응안이 ${count}개 있어요.`,
  warningSkuNotEstimable: '자료가 부족해 판정하지 못한 SKU가 있어요.',
} as const

/** 경고 코드(서버 `explanation.warnings[].code`). 모르는 코드는 AI 원문 문장을 그대로 쓴다 */
export const WARNING_CODE = {
  BASELINE_SHORTAGE_EXISTS: 'BASELINE_SHORTAGE_EXISTS',
  FORECAST_EVENT_OVERLAP: 'FORECAST_EVENT_OVERLAP',
  OPTION_NEEDS_CHECK: 'OPTION_NEEDS_CHECK',
  SKU_NOT_ESTIMABLE: 'SKU_NOT_ESTIMABLE',
} as const
