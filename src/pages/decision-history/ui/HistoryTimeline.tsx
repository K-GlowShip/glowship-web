import { ChartColumn, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { getOptionTypeLabel } from '@/entities/delay-event'
import { getRoleLabel } from '@/entities/session'
import { type AnalysisRunDetail, type Decision, DECISION_TYPE } from '@/shared/api'
import { DECISION_TEXT } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/avatar'

import {
  formatBaseDataAt,
  formatSelectedAt,
  getDecisionReason,
  getMemberOpinions,
} from '../model/history'
import { getDecisionOptionLabel } from '../model/history-display'

interface HistoryTimelineProps {
  decision: Decision
  run: AnalysisRunDetail
}

/**
 * 판단 기록. 분석이 끝난 시점부터 팀원 의견, 팀장의 최종 선택까지 시간순으로 이어서
 * 누가 어떤 대응안을 골랐고 어떤 근거를 댔는지 한눈에 따라가게 한다. 초안 행에서는 그 초안 하나만 이어 붙인다.
 */
export function HistoryTimeline({ decision, run }: HistoryTimelineProps) {
  const isFinal = decision.decisionType === DECISION_TYPE.FINAL
  const reason = getDecisionReason(decision, run)
  const opinions = getMemberOpinions(decision, run)

  return (
    <section className="flex flex-col gap-16pxr">
      <h3 className="text-h3 font-bold">판단 기록</h3>
      <ol className="flex flex-col gap-24pxr">
        <TimelineItem
          marker={
            <span className="relative grid size-32pxr place-items-center rounded-full bg-muted text-muted-foreground">
              <ChartColumn className="size-16pxr" aria-hidden="true" />
            </span>
          }
        >
          <p className="text-b2 font-bold">분석 완료</p>
          <p className="text-caption text-muted-foreground">
            분석 버전 v{run.versionNo}
            {run.inputBasis.dataBasisAt &&
              ` · 기준 데이터 ${formatBaseDataAt(run.inputBasis.dataBasisAt)}`}
          </p>
        </TimelineItem>

        {isFinal &&
          opinions.map((opinion) => (
            <TimelineItem
              key={opinion.memberDraftId}
              marker={<Person name={opinion.author.displayName} />}
            >
              <EntryHead
                name={opinion.author.displayName}
                roleCode={opinion.author.roleCode}
                time={opinion.createdAt}
                optionType={opinion.responseOption?.optionType ?? null}
              />
              <p className="mt-8pxr text-b2 text-muted-foreground">{opinion.opinionText}</p>
            </TimelineItem>
          ))}

        <TimelineItem
          isLast
          marker={
            isFinal ? (
              <span className="relative grid size-32pxr animate-stamp place-items-center rounded-full bg-primary text-primary-foreground motion-reduce:animate-none">
                <CircleCheck className="size-16pxr" aria-hidden="true" />
              </span>
            ) : (
              <Person name={decision.decidedBy.displayName} />
            )
          }
        >
          <div className={cn(isFinal && 'rounded-card bg-primary-50 p-16pxr')}>
            <EntryHead
              name={decision.decidedBy.displayName}
              roleCode={decision.decidedBy.roleCode}
              time={decision.decidedAt}
              optionType={decision.responseOption?.optionType ?? null}
              emphasis={isFinal}
            />
            <p className="mt-12pxr text-caption text-muted-foreground">
              {isFinal ? DECISION_TEXT.SELECTION_REASON : DECISION_TEXT.OPINION}
            </p>
            <p className="text-b1">{reason ?? getDecisionOptionLabel(decision)}</p>
          </div>
        </TimelineItem>
      </ol>
    </section>
  )
}

interface TimelineItemProps {
  marker: ReactNode
  children: ReactNode
  /** 마지막 항목은 아래로 이어지는 선이 없다 */
  isLast?: boolean
}

function TimelineItem({ marker, children, isLast = false }: TimelineItemProps) {
  return (
    <li
      className={cn(
        'relative flex gap-12pxr',
        !isLast &&
          'after:absolute after:top-32pxr after:-bottom-24pxr after:left-16pxr after:w-1pxr after:bg-border',
      )}
    >
      <div className="shrink-0">{marker}</div>
      <div className="min-w-0 flex-1 pt-4pxr">{children}</div>
    </li>
  )
}

function Person({ name }: { name: string }) {
  return (
    <Avatar className="relative" aria-hidden="true">
      {Array.from(name)[0]}
    </Avatar>
  )
}

interface EntryHeadProps {
  name: string
  roleCode: string
  time: string
  optionType: string | null
  emphasis?: boolean
}

/** 누가(이름·역할), 언제, 어떤 대응안을 골랐는지를 한 묶음으로 보여 준다 */
function EntryHead({ name, roleCode, time, optionType, emphasis = false }: EntryHeadProps) {
  return (
    <div className="flex flex-col gap-4pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-12pxr">
        <p className="text-b2">
          <span className="font-bold">{name}</span>{' '}
          <span className="text-muted-foreground">{getRoleLabel(roleCode)}</span>
        </p>
        <time className="text-caption text-muted-foreground">{formatSelectedAt(time)}</time>
      </div>
      <span
        className={cn(
          'inline-flex items-center self-start rounded-full px-10pxr py-2pxr text-b2 font-bold',
          emphasis && 'bg-primary text-primary-foreground',
          !emphasis && optionType && 'bg-muted text-foreground',
          !optionType && 'border border-dashed border-border text-muted-foreground',
        )}
      >
        {optionType ? getOptionTypeLabel(optionType) : DECISION_TEXT.OPINION_ONLY}
      </span>
    </div>
  )
}
