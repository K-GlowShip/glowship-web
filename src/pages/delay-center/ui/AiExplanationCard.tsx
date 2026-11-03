import { Sparkles, TriangleAlert } from 'lucide-react'

import type { AiExplanation } from '../model/delay-center'

interface AiExplanationCardProps {
  explanation: AiExplanation
}

/** AI 설명. 계산 결과를 풀어 쓴 참고 정보이며, 숫자는 위 비교표와 같은 값이다. */
export function AiExplanationCard({ explanation }: AiExplanationCardProps) {
  return (
    <section
      aria-labelledby="ai-explanation-title"
      className="flex flex-col gap-16pxr rounded-card bg-primary-50 p-20pxr"
    >
      <h3
        id="ai-explanation-title"
        className="flex items-center gap-6pxr text-b1 font-bold text-primary"
      >
        <Sparkles className="size-16pxr" aria-hidden="true" />
        AI 설명
        <span className="text-caption font-normal text-muted-foreground">참고 정보</span>
      </h3>

      <dl className="grid gap-12pxr md:grid-cols-3">
        <ExplanationItem label="분석 요약" text={explanation.runSummary} />
        <ExplanationItem label="영향 요약" text={explanation.riskSummary} />
        <ExplanationItem label="추천 근거" text={explanation.recommendation} />
      </dl>

      {explanation.warnings.length > 0 && (
        <ul className="flex flex-col gap-4pxr">
          {explanation.warnings.map((warning) => (
            <li key={warning} className="flex items-center gap-6pxr text-b2 text-warning">
              <TriangleAlert className="size-14pxr shrink-0" aria-hidden="true" />
              {warning}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ExplanationItem({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-4pxr">
      <dt className="text-b2 font-bold text-foreground">{label}</dt>
      <dd className="text-b2 text-muted-foreground">{text}</dd>
    </div>
  )
}
