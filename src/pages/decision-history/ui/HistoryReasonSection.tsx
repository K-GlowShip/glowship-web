import { type AnalysisRunDetail, type Decision, DECISION_TYPE } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { formatNumber } from '@/shared/lib/format-number'
import { Avatar } from '@/shared/ui/avatar'

import { formatSelectedAt, getDecisionReason, getMemberOpinions } from '../model/history'

interface HistoryReasonSectionProps {
  decision: Decision
  run: AnalysisRunDetail
}

/** 선택 이유(초안은 의견)와 팀원 의견 */
export function HistoryReasonSection({ decision, run }: HistoryReasonSectionProps) {
  const reason = getDecisionReason(decision, run)
  const opinions = getMemberOpinions(decision, run)
  const isFinal = decision.decisionType === DECISION_TYPE.FINAL

  return (
    <>
      <section className="flex flex-col gap-12pxr">
        <h3 className="text-h3 font-bold">{isFinal ? '선택 이유' : '의견'}</h3>
        <p className="text-b1">{reason ?? EMPTY_VALUE}</p>
      </section>
      {opinions.length > 0 && (
        <section className="flex flex-col gap-12pxr">
          <h3 className="text-h3 font-bold">
            팀원 의견{' '}
            <span className="text-muted-foreground">{formatNumber(opinions.length)}건</span>
          </h3>
          <ul className="flex flex-col gap-16pxr">
            {opinions.map((opinion) => (
              <li key={opinion.memberDraftId} className="flex gap-12pxr">
                <Avatar aria-hidden="true">{Array.from(opinion.author.displayName)[0]}</Avatar>
                <div className="min-w-0">
                  <p className="text-b2">
                    <span className="font-bold">{opinion.author.displayName}</span>{' '}
                    <span className="text-muted-foreground">
                      {formatSelectedAt(opinion.createdAt)}
                    </span>
                  </p>
                  <p className="text-b2 text-muted-foreground">{opinion.opinionText}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
