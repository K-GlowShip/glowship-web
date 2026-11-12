import { SYNC_SOURCE_LABEL } from '@/entities/data-sync-run'
import { toDelayStatus } from '@/entities/delay-event'
import {
  ANALYSIS_RUN_STATUS,
  type AnalysisRunDetail,
  type DelayEventDetail,
  type DelayEventRun,
} from '@/shared/api'
import { formatYYYYMMDD } from '@/shared/lib/kst-date'

import type {
  AiExplanation,
  AnalysisRunSummary,
  DelayAnalysis,
  DelayCase,
  DelayOption,
  FinalDecision,
  MemberOpinion,
  RiskOrder,
  SkuImpact,
  StageCode,
  TransportMode,
  WarehouseRegion,
} from './delay-center'
import {
  type Feasibility,
  type OptionType,
  type ReasonCode,
  RESULT_CLASS,
  type ResultClass,
  type RiskAttribution,
  type SkuScope,
} from './delay-center-code'
import { DATA_WARNING_TEXT, PROGRESS_STEP_LABEL, STALE_REASON_LABEL } from './delay-center-text'

/** 수집 원천 코드. 라벨 사전의 키와 같다 */
type SourceDomain = keyof typeof SYNC_SOURCE_LABEL

const CALCULATED = 'CALCULATED'
const EXPLANATION_PASSED = 'PASSED'

const isResultClass = (value: string | null): value is ResultClass =>
  Object.values<string>(RESULT_CLASS).includes(value ?? '')

/** 설명 문장 속 근거 표지(`[E1]`)는 화면에 보여 주지 않는다 */
const stripEvidenceMarks = (text: string) => text.replace(/\s?\[E\d+\]/g, '')

const toImpact = (impact: AnalysisRunDetail['inventoryImpacts'][number]): SkuImpact => {
  const estimable = impact.calculationStatus === CALCULATED
  const { shortageQuantity, baselineShortageQuantity } = impact

  return {
    skuCode: impact.sku.skuCode,
    productName: impact.sku.productName,
    region: impact.warehouse.regionCode as WarehouseRegion,
    scope: impact.skuScope as SkuScope,
    estimable,
    // 지연 증분 = 전체 부족 − 기준선 부족(명세 4.5 재고 영향 읽는 법)
    increasedShortage:
      estimable && shortageQuantity !== null && baselineShortageQuantity !== null
        ? Math.max(0, shortageQuantity - baselineShortageQuantity)
        : null,
    safetyStockBreachDate: estimable ? impact.safetyStockBreachDate : null,
    stockoutDate: estimable ? impact.stockoutDate : null,
    stockoutDays: estimable ? impact.stockoutDays : null,
  }
}

const toRiskOrder = (order: AnalysisRunDetail['atRiskOrders'][number]): RiskOrder => ({
  orderCode: order.orderCode,
  riskReason: order.riskReason,
  attribution: order.riskAttribution as RiskAttribution,
  promisedDate: formatYYYYMMDD(order.promisedDeliveryAt),
  expectedDate: formatYYYYMMDD(order.expectedDeliveryAt),
  lines: order.lines.map((line) => ({
    lineNo: line.lineNo,
    skuCode: line.sku.skuCode,
    productName: line.sku.productName,
    openQuantity: line.openQuantity,
  })),
})

const toOption = (option: AnalysisRunDetail['responseOptions'][number]): DelayOption => ({
  id: option.responseOptionId,
  type: option.optionType as OptionType,
  feasibility: option.feasibilityStatus as Feasibility,
  reasonCode: option.reasonCode as ReasonCode | null,
  expectedArrival: option.expectedDeliveryDate,
  securableQuantity: option.securableQuantity,
  delayInducedRecoveredOrders: option.delayInducedRecoveredOrders,
  notRecoveredOrders: option.notRecoveredOrders,
  itemSecuredBlockedOrders: option.itemSecuredBlockedOrders,
  recommended: option.isRecommended,
})

/** 설명 검증을 통과하지 못했으면 설명이 없다(`explanation`이 null) */
const toExplanation = (run: AnalysisRunDetail): AiExplanation | null => {
  const { explanation } = run

  if (!explanation || run.explanationValidationStatus !== EXPLANATION_PASSED) {
    return null
  }
  return {
    runSummary: stripEvidenceMarks(explanation.run_summary),
    riskSummary: stripEvidenceMarks(explanation.risk_summary),
    recommendation: stripEvidenceMarks(explanation.recommendation_explanation),
    warnings: explanation.warnings.map(({ text }) => stripEvidenceMarks(text)),
    optionExplanations: Object.fromEntries(
      explanation.option_explanations.map(({ option_type, text }) => [
        option_type,
        stripEvidenceMarks(text),
      ]),
    ),
  }
}

/** 계산 결과가 하나도 없으면(분석 중·보류·실패·지연 해소) 결과 없음이다 */
const toAnalysis = (run: AnalysisRunDetail): DelayAnalysis | null => {
  const hasResult =
    run.inventoryImpacts.length > 0 || run.atRiskOrders.length > 0 || run.responseOptions.length > 0

  if (!hasResult || !isResultClass(run.resultClass)) {
    return null
  }
  return {
    resultClass: run.resultClass,
    impacts: run.inventoryImpacts.map(toImpact),
    riskOrders: run.atRiskOrders.map(toRiskOrder),
    options: run.responseOptions.map(toOption),
    explanation: toExplanation(run),
  }
}

const toOpinions = (drafts: AnalysisRunDetail['drafts']): MemberOpinion[] =>
  drafts.map((draft) => ({
    id: draft.memberDraftId,
    author: draft.author.displayName,
    createdAt: draft.createdAt,
    optionId: draft.responseOption?.responseOptionId ?? null,
    text: draft.opinionText,
  }))

const toFinalDecision = (decision: AnalysisRunDetail['finalDecision']): FinalDecision | null =>
  decision && {
    author: decision.decidedBy.displayName,
    decidedAt: decision.decidedAt,
    optionId: decision.responseOption.responseOptionId,
    reason: decision.reasonText,
  }

/** 서버 이력 한 줄을 화면 상태로 바꾼다. 모르는 상태의 이력은 상태를 지어내지 않고 뺀다. */
const toRunSummaries = (runs: DelayEventRun[]): AnalysisRunSummary[] =>
  runs.flatMap((run) => {
    const status = toDelayStatus(run.status)

    return status && run.startedAt
      ? [
          {
            runCode: run.runCode,
            versionNo: run.versionNo,
            status,
            failureCode: run.failureCode,
            isLatest: run.isLatest,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
          },
        ]
      : []
  })

const toDataNotice = (warnings: AnalysisRunDetail['inputBasis']['dataWarnings']) =>
  warnings.length === 0
    ? null
    : DATA_WARNING_TEXT(
        warnings.map(
          ({ sourceDomain }) => SYNC_SOURCE_LABEL[sourceDomain as SourceDomain] ?? sourceDomain,
        ),
      )

/**
 * 지연 상세(`GET /delay-events/{id}`)와 현재 분석 실행(`GET /analysis-runs/{runId}`)을 화면 모델로 바꾼다.
 * 실행이 없거나 모르는 상태면 상태를 정할 수 없어 null이다.
 */
export const toDelayCase = (
  detail: DelayEventDetail,
  run: AnalysisRunDetail | null,
): DelayCase | null => {
  const status = toDelayStatus(run?.status)

  if (!run || !status) {
    return null
  }
  return {
    id: detail.delayEventId,
    shipmentCode: detail.shipment.shipmentCode,
    productName: detail.representativeSku?.productName ?? null,
    skuCount: detail.skuCount,
    runId: run.runId,
    runCode: run.runCode,
    route: detail.route,
    transportMode: detail.transportMode as TransportMode,
    status,
    delayDays: detail.delayDays,
    stage: detail.stage as StageCode,
    plannedInbound: detail.planned3plInboundDate,
    expectedInbound: detail.expected3plInboundDate,
    detectedAt: detail.detectedAt,
    closedAt: detail.closedAt,
    baseDataAt: run.inputBasis.dataBasisAt,
    dataNotice: toDataNotice(run.inputBasis.dataWarnings),
    progressStep: PROGRESS_STEP_LABEL[run.status as keyof typeof PROGRESS_STEP_LABEL] ?? null,
    failureCode: run.failureCode,
    failureMessage: run.failureMessage,
    staleReason:
      run.status === ANALYSIS_RUN_STATUS.STALE && run.stalePrimaryReason
        ? (STALE_REASON_LABEL[run.stalePrimaryReason] ?? null)
        : null,
    analysis: toAnalysis(run),
    runs: toRunSummaries(detail.runs),
    opinions: toOpinions(run.drafts),
    finalDecision: toFinalDecision(run.finalDecision),
  }
}
