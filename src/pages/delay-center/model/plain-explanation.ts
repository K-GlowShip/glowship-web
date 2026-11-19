import { formatMMDD } from '@/shared/lib/kst-date'
import { formatNumber } from '@/shared/lib/format-number'

import {
  countRiskOrdersByAttribution,
  type DelayOption,
  FEASIBILITY,
  OPTION_TYPE,
  OPTION_TYPE_LABEL,
  type PlainExplanation,
  REASON_LABEL,
  type ResultClass,
  type RiskOrder,
  SKU_SCOPE,
  type SkuImpact,
} from './delay-center'
import { PLAIN_TEXT, RESULT_CLASS_SENTENCE, WARNING_CODE } from './plain-explanation-text'

/** 위 문장이 보여 줄 SKU 목록의 최대 개수. 넘으면 '외 N개'로 줄인다 */
const MAX_LISTED_SKU = 3

const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3
const FINAL_CONSONANT_COUNT = 28

/** 한글 이름 뒤에 붙이는 주제 조사. 받침이 있으면 '은', 없으면 '는'. 고정된 한글 이름에만 쓴다(코드에는 쓰지 않는다) */
const withTopic = (name: string) => {
  const code = name.charCodeAt(name.length - 1)
  const hasFinalConsonant =
    code >= HANGUL_START &&
    code <= HANGUL_END &&
    (code - HANGUL_START) % FINAL_CONSONANT_COUNT !== 0
  return `${name}${hasFinalConsonant ? '은' : '는'}`
}

const count = formatNumber

export interface PlainCaseInfo {
  shipmentCode: string
  delayDays: number
  plannedInbound: string
  expectedInbound: string
}

export interface PlainSource {
  resultClass: ResultClass
  impacts: SkuImpact[]
  riskOrders: RiskOrder[]
  options: DelayOption[]
  /** 서버 경고: 코드와 AI 원문 문장 */
  warnings: { code: string; text: string }[]
}

/** 분석 요약: 입고가 얼마나 늦어지는지와 결과 분류 한 줄 */
export const plainRunSummary = (
  { shipmentCode, delayDays, plannedInbound, expectedInbound }: PlainCaseInfo,
  resultClass: ResultClass,
) => {
  const planned = formatMMDD(plannedInbound)
  const expected = formatMMDD(expectedInbound)
  const head =
    delayDays > 0
      ? PLAIN_TEXT.runDelayed(shipmentCode, delayDays, planned, expected)
      : PLAIN_TEXT.runOnTime(shipmentCode, planned, expected)

  return `${head} ${RESULT_CLASS_SENTENCE[resultClass]}`
}

/** 영향 요약: 지연 때문에 더 부족해지는 SKU와 늦어질 주문. 말할 내용이 없으면 null */
export const plainImpactSummary = ({ impacts, riskOrders }: PlainSource) => {
  const increased = impacts
    .filter(
      ({ scope, estimable, increasedShortage }) =>
        scope === SKU_SCOPE.IMPACTED && estimable && (increasedShortage ?? 0) > 0,
    )
    .sort(
      (a, b) =>
        (b.increasedShortage ?? 0) - (a.increasedShortage ?? 0) ||
        a.skuCode.localeCompare(b.skuCode),
    )
  const sentences: string[] = []

  if (increased.length === 1) {
    const [{ skuCode, increasedShortage, baselineShortage, shortage }] = increased
    sentences.push(
      PLAIN_TEXT.impactOne(
        skuCode,
        count(increasedShortage ?? 0),
        PLAIN_TEXT.shortageDetail(baselineShortage, shortage),
      ),
    )
  } else if (increased.length > 1) {
    const listed = increased
      .slice(0, MAX_LISTED_SKU)
      .map(({ skuCode, increasedShortage, baselineShortage, shortage }) =>
        PLAIN_TEXT.impactListItem(
          skuCode,
          count(increasedShortage ?? 0),
          PLAIN_TEXT.shortageDetail(baselineShortage, shortage),
        ),
      )
    const rest = increased.length - MAX_LISTED_SKU
    const list = [...listed, ...(rest > 0 ? [PLAIN_TEXT.impactListMore(count(rest))] : [])].join(
      ', ',
    )
    sentences.push(PLAIN_TEXT.impactMany(count(increased.length), list))
  }

  const { delayInduced, preExisting } = countRiskOrdersByAttribution(riskOrders)
  if (delayInduced > 0) {
    sentences.push(PLAIN_TEXT.delayInducedOrders(count(delayInduced)))
  }
  if (preExisting > 0) {
    sentences.push(PLAIN_TEXT.preExistingOrders(count(preExisting), delayInduced > 0))
  }

  return sentences.length > 0 ? sentences.join(' ') : null
}

/** 대응안 한 줄: 실행 가능 여부와, 회복되는 위험 주문·남는 커버 수량 */
export const plainOption = (option: DelayOption) => {
  const name = withTopic(OPTION_TYPE_LABEL[option.type])
  const reason = option.reasonCode ? ` ${REASON_LABEL[option.reasonCode]}.` : ''

  if (option.feasibility === FEASIBILITY.NOT_FEASIBLE) {
    return `${PLAIN_TEXT.optionCannot(name)}${reason}`
  }
  if (option.feasibility === FEASIBILITY.NEEDS_CHECK) {
    return `${PLAIN_TEXT.optionNeedsCheck(name)}${reason}`
  }

  const recovered = option.delayInducedRecoveredOrders
  const notRecovered = option.notRecoveredOrders

  if (option.type === OPTION_TYPE.KEEP_PLAN) {
    return notRecovered !== null && notRecovered > 0
      ? `${PLAIN_TEXT.keepPlanNoStock(name)} ${PLAIN_TEXT.keepPlanRisk(count(notRecovered))}`
      : PLAIN_TEXT.keepPlanNoStock(name)
  }

  const total = (recovered ?? 0) + (notRecovered ?? 0)
  const leftover = option.reductionCommittedTotal
  // '주문 회복 후 남는 커버 수량'은 다른 권역 창고 출고에서만 뜻이 확인됐다(다른 대응안의 감축 확정 수량은 뜻을 확인한 뒤 추가한다)
  const hasLeftover =
    option.type === OPTION_TYPE.OTHER_REGION_FULFILL && leftover !== null && leftover > 0
  const sentences: string[] = []

  if (total > 0 && recovered !== null && recovered > 0) {
    sentences.push(PLAIN_TEXT.optionRecovers(name, count(total), count(recovered)))
  } else if (total > 0) {
    sentences.push(PLAIN_TEXT.optionRecoversNone(name))
  } else {
    sentences.push(PLAIN_TEXT.optionFeasible(name))
  }
  if (hasLeftover) {
    sentences.push(
      recovered !== null && recovered > 0
        ? PLAIN_TEXT.leftoverAfterRecovery(count(leftover))
        : PLAIN_TEXT.leftoverOnly(count(leftover)),
    )
  }
  return sentences.join(' ')
}

/**
 * 추천 근거: 추천 대응안 카드에 붙는 문장. 추천 대응안이 없으면 null.
 * 서버 추천 순위는 ① 회복하는 위험 주문 수 ② 감축 확정 수량 ③ 도착일 순이라서, 같은 분석의 다른 실행 가능 대응안과
 * 숫자를 견줘 사실인 것만 근거로 쓴다. 둘 다 같아 가려지지 않으면 순위만 말한다.
 */
export const plainRecommendation = (options: DelayOption[]) => {
  const recommended = options.find(({ recommended: isRecommended }) => isRecommended)

  if (!recommended) {
    return null
  }
  if (recommended.type === OPTION_TYPE.KEEP_PLAN) {
    return PLAIN_TEXT.recommendedKeepPlan
  }

  const others = options.filter(
    ({ id, feasibility }) => id !== recommended.id && feasibility === FEASIBILITY.FEASIBLE,
  )
  const maxOf = (pick: (option: DelayOption) => number | null) =>
    Math.max(0, ...others.map((option) => pick(option) ?? 0))

  const recovered = recommended.delayInducedRecoveredOrders ?? 0
  const otherRecovered = maxOf((option) => option.delayInducedRecoveredOrders)
  if (recovered > otherRecovered) {
    return PLAIN_TEXT.recommendedMostRecovered(
      count(recovered + (recommended.notRecoveredOrders ?? 0)),
      count(recovered),
    )
  }

  const reduced = recommended.reductionCommittedTotal ?? 0
  if (reduced > maxOf((option) => option.reductionCommittedTotal)) {
    return PLAIN_TEXT.recommendedMostReduced(count(reduced), recovered > 0)
  }
  return PLAIN_TEXT.recommendedRank
}

/** 경고 문장. 코드를 아는 경고는 쉬운 문장으로, 모르는 코드는 AI 원문 그대로 둔다 */
export const plainWarnings = ({ warnings, impacts, options }: PlainSource) =>
  warnings.map(({ code, text }) => {
    switch (code) {
      case WARNING_CODE.BASELINE_SHORTAGE_EXISTS:
        // 영향 SKU만이 아니라 모든 행에서 센다(IMPACTED만 세면 AI 원문 숫자와 달라진다)
        return PLAIN_TEXT.warningBaselineShortage(
          count(impacts.filter(({ baselineShortage }) => (baselineShortage ?? 0) > 0).length),
        )
      case WARNING_CODE.FORECAST_EVENT_OVERLAP:
        return PLAIN_TEXT.warningForecastEventOverlap
      case WARNING_CODE.OPTION_NEEDS_CHECK:
        return PLAIN_TEXT.warningOptionNeedsCheck(
          count(
            options.filter(({ feasibility }) => feasibility === FEASIBILITY.NEEDS_CHECK).length,
          ),
        )
      case WARNING_CODE.SKU_NOT_ESTIMABLE:
        return PLAIN_TEXT.warningSkuNotEstimable
      default:
        return text
    }
  })

/** 서버 값으로 만든 쉬운 문장 묶음. 만들 수 없는 칸은 null이라 화면이 AI 원문으로 대신한다 */
export const toPlainExplanation = (
  caseInfo: PlainCaseInfo,
  source: PlainSource,
): PlainExplanation => ({
  runSummary: plainRunSummary(caseInfo, source.resultClass),
  impactSummary: plainImpactSummary(source),
  warnings: plainWarnings(source),
  options: Object.fromEntries(source.options.map((option) => [option.id, plainOption(option)])),
  recommendation: plainRecommendation(source.options),
})
