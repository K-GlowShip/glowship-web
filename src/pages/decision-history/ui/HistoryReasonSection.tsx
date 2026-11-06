import { type AnalysisRunDetail, type Decision, DECISION_TYPE } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'

import {
  formatBaseDataAt,
  formatSelectedAt,
  getDecisionReason,
  getMemberOpinions,
} from '../model/history'

interface HistoryReasonSectionProps {
  decision: Decision
  run: AnalysisRunDetail
}

/** 선택 이유(초안은 의견), 팀원 의견, 기준 데이터 시각과 실행 ID */
export function HistoryReasonSection({ decision, run }: HistoryReasonSectionProps) {
  const reason = getDecisionReason(decision, run)
  const opinions = getMemberOpinions(decision, run)
  const isFinal = decision.decisionType === DECISION_TYPE.FINAL

  return (
    <section className="flex flex-col gap-12pxr rounded-card bg-primary-50 p-20pxr">
      <p className="text-b1">
        {isFinal ? '선택 이유' : '의견'}: {reason ?? EMPTY_VALUE}
      </p>
      {opinions.length > 0 && (
        <ul className="flex flex-col gap-4pxr text-b2 text-muted-foreground">
          {opinions.map((opinion) => (
            <li key={opinion.memberDraftId}>
              {opinion.author.displayName} · {formatSelectedAt(opinion.createdAt)} “
              {opinion.opinionText}”
            </li>
          ))}
        </ul>
      )}
      <p className="text-caption text-muted-foreground">
        기준 데이터{' '}
        {run.inputBasis.dataBasisAt ? formatBaseDataAt(run.inputBasis.dataBasisAt) : EMPTY_VALUE} ·
        실행 ID {run.runCode ?? EMPTY_VALUE}
      </p>
    </section>
  )
}
