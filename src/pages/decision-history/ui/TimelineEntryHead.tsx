import { getOptionTypeLabel } from '@/entities/delay-event'
import { getRoleLabel } from '@/entities/session'
import type { UserSummary } from '@/shared/api'
import { DECISION_TEXT } from '@/shared/config'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'

interface TimelineEntryHeadProps {
  author: UserSummary
  time: string
  optionType: string | null
}

/** 누가(이름·역할), 언제, 어떤 대응안을 골랐는지. 대응안은 칩으로, 의견만 썼으면 중립 칩으로 */
export function TimelineEntryHead({ author, time, optionType }: TimelineEntryHeadProps) {
  return (
    <div className="flex flex-col gap-6pxr pt-5pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-12pxr">
        <p className="text-b2">
          <span className="font-bold">{author.displayName}</span>{' '}
          <span className="text-muted-foreground">{getRoleLabel(author.roleCode)}</span>
        </p>
        <time dateTime={time} className="text-caption text-muted-foreground tabular-nums">
          {formatYYYYMMDDHHmm(time)}
        </time>
      </div>
      <Badge variant={optionType ? 'info' : 'neutral'} dot={false} className="self-start">
        {optionType ? getOptionTypeLabel(optionType) : DECISION_TEXT.OPINION_ONLY}
      </Badge>
    </div>
  )
}
