import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import { type ClientRole, type DelayCase, formatMonthDay, STAGE_LABEL } from '../model/delay-center'
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

      {delayCase.status === 'needs_reanalysis' && (
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
          <ImpactSection analysis={analysis} expectedInbound={delayCase.expectedInbound} />
          <AtRiskOrders orders={analysis.riskOrders} />

          <section aria-labelledby="options-title" className="flex flex-col gap-16pxr">
            <h3 id="options-title" className="text-h3 font-bold">
              대응안 비교
            </h3>
            <OptionTable options={analysis.options} />
          </section>

          {analysis.explanation && <AiExplanationCard explanation={analysis.explanation} />}

          <DecisionSection delayCase={delayCase} analysis={analysis} role={role} />
        </>
      ) : (
        <NoResultNotice delayCase={delayCase} />
      )}
    </article>
  )
}

/** 결과가 없는 상태(분석 중·보류·실패)의 안내. */
function NoResultNotice({ delayCase }: { delayCase: DelayCase }) {
  if (delayCase.status === 'analyzing') {
    return (
      <p
        role="status"
        className="rounded-card bg-info-bg px-24pxr py-32pxr text-center text-b1 text-info"
      >
        {delayCase.progressStep ?? DEFAULT_PROGRESS_STEP} · {ANALYSIS_NOTICE.IN_PROGRESS}
      </p>
    )
  }

  return (
    <div className="flex flex-col items-start gap-12pxr rounded-card bg-danger-bg p-24pxr text-danger">
      <p className="text-b1 font-bold">{delayCase.failureMessage ?? ANALYSIS_NOTICE.NO_RESULT}</p>
      <p className="text-b2">{ANALYSIS_NOTICE.REANALYZE_GUIDE}</p>
    </div>
  )
}

function SummaryItem({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex flex-col gap-4pxr">
      <dt className="text-b2 text-muted-foreground">{label}</dt>
      <dd className={cn('text-h2 font-bold', danger && 'text-danger')}>{value}</dd>
    </div>
  )
}
