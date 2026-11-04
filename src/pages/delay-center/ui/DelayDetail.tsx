import {
  type ClientRole,
  type DelayAnalysis,
  type DelayCase,
  DETAIL_SECTION,
  getDetailSections,
  getOptionsMissingData,
  hasNoFeasibleOption,
} from '../model/delay-center'
import { ANALYSIS_NOTICE } from '../model/delay-center-text'
import { AiExplanationCard } from './AiExplanationCard'
import { AnalysisInfo } from './AnalysisInfo'
import { AtRiskOrders } from './AtRiskOrders'
import { DecisionSection } from './DecisionSection'
import { DelayDetailHeader } from './DelayDetailHeader'
import { ImpactSection } from './ImpactSection'
import { OptionTable } from './OptionTable'
import { RunHistory } from './RunHistory'
import { ShipmentSummary } from './ShipmentSummary'
import { StatusNotice } from './StatusNotice'

interface DelayDetailProps {
  delayCase: DelayCase
  role: ClientRole
}

/**
 * 지연 상세. 위에서부터 어떤 건인가(머리·선적 요약) → 이 분석을 믿을 수 있는가(분석 정보·상태 안내)
 * → 무엇이 위험한가(재고 영향·위험 주문) → 무엇을 할 수 있는가(대응안·설명) → 누가 무엇을 골랐는가(선택) → 이전 분석(이력) 순서다.
 * 상태마다 보여 줄 섹션은 `getDetailSections`가 정한다.
 */
export function DelayDetail({ delayCase, role }: DelayDetailProps) {
  const { analysis } = delayCase
  const sections = getDetailSections(delayCase)

  return (
    <article className="flex min-w-0 flex-col gap-24pxr rounded-panel border border-border bg-card p-32pxr">
      <DelayDetailHeader delayCase={delayCase} />
      <ShipmentSummary delayCase={delayCase} />
      <AnalysisInfo delayCase={delayCase} />
      <StatusNotice delayCase={delayCase} />

      {analysis && (
        <>
          {sections.includes(DETAIL_SECTION.IMPACT) && (
            <ImpactSection analysis={analysis} expectedInbound={delayCase.expectedInbound} />
          )}
          {sections.includes(DETAIL_SECTION.RISK_ORDERS) && (
            <AtRiskOrders orders={analysis.riskOrders} />
          )}

          {sections.includes(DETAIL_SECTION.OPTIONS) && (
            <section aria-labelledby="options-title" className="flex flex-col gap-16pxr">
              <h3 id="options-title" className="text-h3 font-bold">
                대응안 비교
              </h3>
              <OptionNotices options={analysis.options} />
              <OptionTable
                options={analysis.options}
                recommendation={analysis.explanation?.recommendation ?? null}
              />
            </section>
          )}

          {sections.includes(DETAIL_SECTION.EXPLANATION) && analysis.explanation && (
            <AiExplanationCard
              explanation={analysis.explanation}
              showRecommendation={!analysis.options.some((option) => option.recommended)}
            />
          )}

          {sections.includes(DETAIL_SECTION.DECISION) && (
            <DecisionSection delayCase={delayCase} analysis={analysis} role={role} />
          )}
        </>
      )}

      {sections.includes(DETAIL_SECTION.HISTORY) && <RunHistory runs={delayCase.runs} />}
    </article>
  )
}

/** 대응안을 판정하지 못하거나 실행할 수 없는 경우의 안내. 사유는 표의 각 행에 있다. */
function OptionNotices({ options }: { options: DelayAnalysis['options'] }) {
  const notices = [
    hasNoFeasibleOption(options) && ANALYSIS_NOTICE.NO_FEASIBLE_OPTION,
    getOptionsMissingData(options).length > 0 && ANALYSIS_NOTICE.MISSING_DATA,
  ].filter((notice) => notice !== false)

  return notices.map((notice) => (
    <p
      key={notice}
      role="status"
      className="rounded-card bg-warning-bg px-16pxr py-12pxr text-b2 text-warning"
    >
      {notice}
    </p>
  ))
}
