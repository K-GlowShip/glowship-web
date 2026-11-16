import { type AnalysisRunDetail, type Decision, DECISION_TYPE } from '@/shared/api'
import { DECISION_TEXT } from '@/shared/config'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import { getDecisionReason, getMemberOpinions } from '../model/history'
import { FinalDecisionCard } from './FinalDecisionCard'
import { TimelineEntryHead } from './TimelineEntryHead'
import { FinalMarker, PersonMarker, StartMarker, TimelineItem } from './TimelineItem'

interface HistoryTimelineProps {
  decision: Decision
  run: AnalysisRunDetail
}

/**
 * 판단 기록. 분석이 끝난 시점부터 팀원 의견, 팀장의 최종 선택까지 시간순으로 이어서
 * 누가 어떤 대응안을 골랐고 어떤 근거를 댔는지 따라가게 한다. 초안 행에서는 그 초안 하나만 이어 붙인다.
 * 사람은 아바타로, 고른 대응안은 칩으로 보여 주고(지연 대응 센터의 팀원 의견과 같은 모양),
 * 최종 선택만 도장 표식과 연한 보라 바탕, 큰 대응안 글자로 가장 눈에 띄게 둔다.
 */
export function HistoryTimeline({ decision, run }: HistoryTimelineProps) {
  const isFinal = decision.decisionType === DECISION_TYPE.FINAL
  const reason = getDecisionReason(decision, run)
  const opinions = getMemberOpinions(decision, run)

  return (
    <section className="flex flex-col gap-20pxr">
      <h3 className="text-b1 font-bold">판단 기록</h3>
      <ol className="flex flex-col">
        <TimelineItem marker={<StartMarker />}>
          <p className="pt-5pxr text-b2 text-muted-foreground">
            분석 v{run.versionNo} 완료
            {run.inputBasis.dataBasisAt &&
              ` · 기준 데이터 ${formatYYYYMMDDHHmm(run.inputBasis.dataBasisAt)}`}
          </p>
        </TimelineItem>

        {isFinal &&
          opinions.map((opinion) => (
            <TimelineItem
              key={opinion.memberDraftId}
              marker={<PersonMarker name={opinion.author.displayName} />}
            >
              <TimelineEntryHead
                author={opinion.author}
                time={opinion.createdAt}
                optionType={opinion.responseOption?.optionType ?? null}
              />
              <p className="mt-8pxr text-b2 wrap-break-word whitespace-pre-wrap text-muted-foreground">
                {opinion.opinionText}
              </p>
            </TimelineItem>
          ))}

        {isFinal ? (
          <TimelineItem isLast marker={<FinalMarker />}>
            <FinalDecisionCard decision={decision} reason={reason} />
          </TimelineItem>
        ) : (
          <TimelineItem isLast marker={<PersonMarker name={decision.decidedBy.displayName} />}>
            <TimelineEntryHead
              author={decision.decidedBy}
              time={decision.decidedAt}
              optionType={decision.responseOption?.optionType ?? null}
            />
            {reason && (
              <div className="mt-12pxr flex flex-col gap-4pxr">
                <p className="text-caption text-muted-foreground">{DECISION_TEXT.OPINION}</p>
                <p className="text-b1 leading-relaxed wrap-break-word whitespace-pre-wrap">
                  {reason}
                </p>
              </div>
            )}
          </TimelineItem>
        )}
      </ol>
    </section>
  )
}
