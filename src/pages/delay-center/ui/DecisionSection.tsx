import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import { type DelayAnalysis, type DelayCase, OPTION_TYPE_LABEL } from '../model/delay-center'
import { MemberOpinions } from './MemberOpinions'

interface DecisionSectionProps {
  delayCase: DelayCase
  analysis: DelayAnalysis
  /** 최종 선택 전에 보여 줄 내용. 선택할 수 있으면 입력 폼, 없으면 이유 안내다 */
  children: ReactNode
}

/**
 * 판단을 남기는 자리. 왼쪽에 팀원 의견을 두고, 오른쪽에 최종 선택 결과를 둔다.
 * 최종 선택 전이면 오른쪽에 `children`(입력 폼이나 선택할 수 없는 이유)을 보여 준다.
 */
export function DecisionSection({ delayCase, analysis, children }: DecisionSectionProps) {
  const { finalDecision } = delayCase
  const finalOption = analysis.options.find((option) => option.id === finalDecision?.optionId)

  return (
    <div className="grid gap-32pxr lg:grid-cols-2">
      <MemberOpinions opinions={delayCase.opinions} options={analysis.options} />

      <div className="lg:border-l lg:border-border lg:pl-32pxr">
        {finalDecision ? (
          <div className="flex flex-col gap-12pxr">
            <div className="flex flex-col gap-4pxr">
              <p className="flex items-center gap-4pxr text-caption font-bold text-success">
                <Check className="size-14pxr" aria-hidden="true" />
                선택 완료
              </p>
              <p className="text-h2 font-bold">
                {finalOption ? OPTION_TYPE_LABEL[finalOption.type] : ''}
              </p>
            </div>
            <p className="text-b1 whitespace-pre-wrap text-foreground">{finalDecision.reason}</p>
            <p className="text-caption text-muted-foreground">
              {[
                finalDecision.author,
                formatYYYYMMDDHHmm(finalDecision.decidedAt),
                delayCase.runCode && `실행 ${delayCase.runCode}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
