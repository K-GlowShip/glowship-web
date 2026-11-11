import { Check } from 'lucide-react'

import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import {
  canDecide,
  type ClientRole,
  type DelayAnalysis,
  type DelayCase,
  OPTION_TYPE_LABEL,
} from '../model/delay-center'
import { ANALYSIS_NOTICE } from '../model/delay-center-text'
import { DecisionForm } from './DecisionForm'
import { MemberOpinions } from './MemberOpinions'

interface DecisionSectionProps {
  delayCase: DelayCase
  analysis: DelayAnalysis
  /** 선택 권한이 없는 계정이면 null */
  role: ClientRole | null
}

export function DecisionSection({ delayCase, analysis, role }: DecisionSectionProps) {
  const { finalDecision } = delayCase
  const finalOption = analysis.options.find((option) => option.id === finalDecision?.optionId)

  return (
    <section
      aria-labelledby="decision-title"
      className="flex flex-col gap-20pxr border-t border-border pt-24pxr"
    >
      <h3 id="decision-title" className="text-h3 font-bold">
        대응안 선택
      </h3>

      <MemberOpinions opinions={delayCase.opinions} options={analysis.options} />

      {finalDecision ? (
        <div className="flex flex-col gap-12pxr rounded-card bg-success-bg p-20pxr text-success">
          <p className="flex items-center gap-6pxr text-b1 font-bold">
            <Check className="size-18pxr" aria-hidden="true" />
            선택 완료 · {finalOption ? OPTION_TYPE_LABEL[finalOption.type] : ''}
          </p>
          <p className="text-b1 whitespace-pre-wrap text-foreground">{finalDecision.reason}</p>
          <p className="text-caption">
            {[
              finalDecision.author,
              formatYYYYMMDDHHmm(finalDecision.decidedAt),
              delayCase.runCode && `실행 ${delayCase.runCode}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      ) : role && canDecide(delayCase) ? (
        <DecisionForm
          key={delayCase.id}
          role={role}
          options={analysis.options}
          opinions={delayCase.opinions}
        />
      ) : (
        <p className="rounded-card bg-background px-16pxr py-12pxr text-b2 text-muted-foreground">
          {role ? ANALYSIS_NOTICE.CANNOT_DECIDE : ANALYSIS_NOTICE.NO_DECIDE_ROLE}
        </p>
      )}
    </section>
  )
}
