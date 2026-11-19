import {
  type Feasibility,
  type OptionType,
  type PlainExplanation,
  type ReasonCode,
  RESULT_CLASS,
  type ResultClass,
  toPlainExplanation,
} from '@/entities/delay-event'
import { type AnalysisRunDetail, isExplanationPassed } from '@/shared/api'

/** 서버가 계산을 마친 SKU 행의 계산 상태 */
const CALCULATED = 'CALCULATED'

const isResultClass = (value: string | null): value is ResultClass =>
  Object.values<string>(RESULT_CLASS).includes(value ?? '')

/**
 * 당시 분석(서버 응답 그대로)의 AI 설명을, 지연 대응 센터와 같은 쉬운 문장으로 만든다.
 * 같은 문장 함수를 쓰므로 두 화면의 말이 같다. 설명 검증을 통과하지 못했거나 결과 분류를 몰라 만들 수 없으면 null이다.
 */
export const toHistoryPlain = (run: AnalysisRunDetail): PlainExplanation | null => {
  const { explanation, resultClass, target } = run

  if (!explanation || !isExplanationPassed(run) || !isResultClass(resultClass)) {
    return null
  }
  return toPlainExplanation(
    {
      shipmentCode: target.shipment.shipmentCode,
      delayDays: target.delayDays,
      plannedInbound: target.planned3plInboundDate,
      expectedInbound: target.expected3plInboundDate,
    },
    {
      resultClass,
      warnings: explanation.warnings,
      impacts: run.inventoryImpacts.map((impact) => {
        const estimable = impact.calculationStatus === CALCULATED
        const { shortageQuantity, baselineShortageQuantity } = impact

        return {
          skuCode: impact.sku.skuCode,
          scope: impact.skuScope,
          estimable,
          // 지연 증분 = 전체 부족 − 기준선 부족(명세 4.5)
          increasedShortage:
            estimable && shortageQuantity !== null && baselineShortageQuantity !== null
              ? Math.max(0, shortageQuantity - baselineShortageQuantity)
              : null,
          shortage: estimable ? shortageQuantity : null,
          baselineShortage: estimable ? baselineShortageQuantity : null,
        }
      }),
      riskOrders: run.atRiskOrders.map((order) => ({ attribution: order.riskAttribution })),
      options: run.responseOptions.map((option) => ({
        id: option.responseOptionId,
        type: option.optionType as OptionType,
        feasibility: option.feasibilityStatus as Feasibility,
        reasonCode: option.reasonCode as ReasonCode | null,
        delayInducedRecoveredOrders: option.delayInducedRecoveredOrders,
        notRecoveredOrders: option.notRecoveredOrders,
        reductionCommittedTotal: option.reductionCommittedTotal,
        recommended: option.isRecommended,
      })),
    },
  )
}
