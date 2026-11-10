import { DECISION_TEXT } from '@/shared/config'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'

import { type DelayOption, type MemberOpinion, OPTION_TYPE_LABEL } from '../model/delay-center'

interface MemberOpinionsProps {
  opinions: MemberOpinion[]
  options: DelayOption[]
}

export function MemberOpinions({ opinions, options }: MemberOpinionsProps) {
  return (
    <section aria-labelledby="member-opinions-title" className="flex flex-col gap-12pxr">
      <h3 id="member-opinions-title" className="text-b1 font-bold">
        {DECISION_TEXT.MEMBER_OPINION}{' '}
        <span className="text-muted-foreground">{opinions.length}</span>
      </h3>

      {opinions.length === 0 ? (
        <p className="rounded-card bg-background px-16pxr py-20pxr text-center text-b2 text-muted-foreground">
          아직 팀원 의견이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-8pxr">
          {opinions.map((opinion) => {
            const option = options.find(({ id }) => id === opinion.optionId)
            return (
              <li
                key={opinion.id}
                className="flex gap-12pxr rounded-card border border-border bg-card p-16pxr"
              >
                <Avatar aria-hidden="true">{opinion.author[0]}</Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-6pxr">
                  <div className="flex flex-wrap items-center gap-x-8pxr gap-y-4pxr">
                    <span className="text-b1 font-bold">{opinion.author}</span>
                    <time
                      className="text-caption text-muted-foreground"
                      dateTime={opinion.createdAt}
                    >
                      {formatYYYYMMDDHHmm(opinion.createdAt)}
                    </time>
                    {option && (
                      <Badge variant="info" dot={false}>
                        {OPTION_TYPE_LABEL[option.type]}
                      </Badge>
                    )}
                  </div>
                  {opinion.text && (
                    <p className="text-b1 whitespace-pre-wrap text-foreground">{opinion.text}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
