import { getRoleLabel } from '@/entities/session'
import { DECISION_STATUS, type Decision } from '@/shared/api'
import { DECISION_TEXT, EMPTY_VALUE } from '@/shared/config'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import { HISTORY_STATUS_LABEL } from '../model/history'
import { getDecisionOptionLabel } from '../model/history-display'

interface FinalDecisionCardProps {
  decision: Decision
  reason: string | null
}

/**
 * 팀장의 최종 선택. 이 서랍에서 가장 중요한 내용이라 연한 보라 바탕 위에
 * 고른 대응안을 큰 글자로, 그 아래 선택 이유를 본문 크기로 둔다.
 */
export function FinalDecisionCard({ decision, reason }: FinalDecisionCardProps) {
  const { decidedBy } = decision

  return (
    <div className="flex flex-col gap-16pxr rounded-card bg-primary-50 p-20pxr">
      <div className="flex flex-col gap-4pxr">
        <div className="flex flex-wrap items-baseline justify-between gap-x-12pxr">
          <p className="text-caption font-bold text-primary">
            {HISTORY_STATUS_LABEL[DECISION_STATUS.FINAL]}
          </p>
          <time
            dateTime={decision.decidedAt}
            className="text-caption text-muted-foreground tabular-nums"
          >
            {formatYYYYMMDDHHmm(decision.decidedAt)}
          </time>
        </div>
        <p className="text-h2 font-bold wrap-break-word">{getDecisionOptionLabel(decision)}</p>
        <p className="text-b2">
          <span className="font-bold">{decidedBy.displayName}</span>{' '}
          <span className="text-muted-foreground">{getRoleLabel(decidedBy.roleCode)}</span>
        </p>
      </div>
      <div className="flex flex-col gap-4pxr border-t border-primary-900/10 pt-16pxr">
        <p className="text-caption text-muted-foreground">{DECISION_TEXT.SELECTION_REASON}</p>
        <p className="text-b1 leading-relaxed wrap-break-word whitespace-pre-wrap">
          {reason ?? EMPTY_VALUE}
        </p>
      </div>
    </div>
  )
}
