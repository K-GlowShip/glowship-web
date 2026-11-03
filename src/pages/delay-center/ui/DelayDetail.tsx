import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import {
  type ClientRole,
  type DelayAnalysis,
  DELAY_STATUS,
  type DelayCase,
  DETAIL_SECTION,
  formatMonthDay,
  getDetailSections,
  getOptionsMissingData,
  hasNoFeasibleOption,
  NO_RISK_MESSAGE,
  RESULT_CLASS,
  STAGE_LABEL,
} from '../model/delay-center'
import { ANALYSIS_NOTICE, DEFAULT_PROGRESS_STEP, EMPTY_TEXT } from '../model/delay-center-text'
import { AiExplanationCard } from './AiExplanationCard'
import { AtRiskOrders } from './AtRiskOrders'
import { DecisionSection } from './DecisionSection'
import { DelayDetailHeader } from './DelayDetailHeader'
import { ImpactSection } from './ImpactSection'
import { OptionTable } from './OptionTable'

interface DelayDetailProps {
  delayCase: DelayCase
  role: ClientRole
}

export function DelayDetail({ delayCase, role }: DelayDetailProps) {
  const { analysis } = delayCase
  const sections = getDetailSections(delayCase)

  return (
    <article className="flex min-w-0 flex-col gap-24pxr rounded-panel border border-border bg-card p-32pxr lg:flex-1">
      <DelayDetailHeader delayCase={delayCase} />

      <div className="flex flex-col gap-4pxr text-b2 text-muted-foreground">
        <p>
          {delayCase.baseDataAt
            ? `데이터 기준 ${formatYYYYMMDDHHmm(delayCase.baseDataAt)} KST`
            : EMPTY_TEXT.DATA_BASIS}
        </p>
        {delayCase.dataNotice && <p className="text-warning">{delayCase.dataNotice}</p>}
      </div>

      <dl className="grid grid-cols-2 gap-16pxr rounded-card bg-background p-24pxr md:grid-cols-4">
        <SummaryItem label="운송 단계" value={STAGE_LABEL[delayCase.stage]} />
        <SummaryItem label="계획 입고" value={formatMonthDay(delayCase.plannedInbound)} />
        <SummaryItem label="예상 입고" value={formatMonthDay(delayCase.expectedInbound)} />
        <SummaryItem label="지연 일수" value={`+${delayCase.delayDays}일`} danger />
      </dl>

      {delayCase.status === DELAY_STATUS.NEEDS_REANALYSIS && (
        <p
          role="status"
          className="rounded-card bg-warning-bg px-16pxr py-12pxr text-b1 text-warning"
        >
          {ANALYSIS_NOTICE.STALE}
          {delayCase.staleReason && ` ${delayCase.staleReason}`}
        </p>
      )}

      {analysis ? (
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
              <OptionTable options={analysis.options} />
            </section>
          )}

          {sections.includes(DETAIL_SECTION.EXPLANATION) && analysis.explanation && (
            <AiExplanationCard explanation={analysis.explanation} />
          )}

          {sections.includes(DETAIL_SECTION.DECISION) && (
            <DecisionSection delayCase={delayCase} analysis={analysis} role={role} />
          )}

          {delayCase.status === DELAY_STATUS.NO_RISK && (
            <NoRiskNotice resultClass={analysis.resultClass} />
          )}
        </>
      ) : (
        <NoResultNotice delayCase={delayCase} />
      )}
    </article>
  )
}

/** 위험 주문이 없어 대응안 분석 없이 끝난 결과의 안내. */
function NoRiskNotice({ resultClass }: { resultClass: DelayAnalysis['resultClass'] }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-4pxr rounded-card bg-success-bg px-24pxr py-24pxr text-success"
    >
      <p className="text-b1 font-bold">{ANALYSIS_NOTICE.NO_RISK}</p>
      {(resultClass === RESULT_CLASS.PURE_NO_RISK ||
        resultClass === RESULT_CLASS.WARNING_NO_RISK) && (
        <p className="text-b2">{NO_RISK_MESSAGE[resultClass]}</p>
      )}
    </div>
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

/** 결과가 없는 상태(분석 중·보류·실패·지연 해소)의 안내. 상태를 추가하면 여기도 적어야 컴파일된다. */
function NoResultNotice({ delayCase }: { delayCase: DelayCase }) {
  switch (delayCase.status) {
    case DELAY_STATUS.ANALYZING:
      return (
        <p
          role="status"
          className="rounded-card bg-info-bg px-24pxr py-32pxr text-center text-b1 text-info"
        >
          {delayCase.progressStep ?? DEFAULT_PROGRESS_STEP} · {ANALYSIS_NOTICE.IN_PROGRESS}
        </p>
      )
    case DELAY_STATUS.NO_DELAY:
      return (
        <p
          role="status"
          className="rounded-card bg-background px-24pxr py-32pxr text-center text-b1 text-muted-foreground"
        >
          {ANALYSIS_NOTICE.NO_DELAY}
        </p>
      )
    case DELAY_STATUS.ON_HOLD:
      return (
        <div className="flex flex-col items-start gap-12pxr rounded-card bg-danger-bg p-24pxr text-danger">
          <p className="text-b1 font-bold">{delayCase.failureMessage ?? ANALYSIS_NOTICE.ON_HOLD}</p>
          <p className="text-b2">{ANALYSIS_NOTICE.REANALYZE_GUIDE}</p>
        </div>
      )
    case DELAY_STATUS.READY:
    case DELAY_STATUS.NEEDS_REANALYSIS:
    case DELAY_STATUS.FINALIZED:
    case DELAY_STATUS.NO_RISK:
      // 결과가 있어야 하는 상태인데 없다. 서버 응답이 비었을 때를 위한 안내다.
      return (
        <div className="flex flex-col items-start gap-12pxr rounded-card bg-danger-bg p-24pxr text-danger">
          <p className="text-b1 font-bold">
            {delayCase.failureMessage ?? ANALYSIS_NOTICE.NO_RESULT}
          </p>
          <p className="text-b2">{ANALYSIS_NOTICE.REANALYZE_GUIDE}</p>
        </div>
      )
  }
}

function SummaryItem({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex flex-col gap-4pxr">
      <dt className="text-b2 text-muted-foreground">{label}</dt>
      <dd className={cn('text-h2 font-bold', danger && 'text-danger')}>{value}</dd>
    </div>
  )
}
