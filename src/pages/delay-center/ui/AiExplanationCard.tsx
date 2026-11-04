import { Sparkles, TriangleAlert } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

import type { AiExplanation } from '../model/delay-center'

interface AiExplanationCardProps {
  explanation: AiExplanation
  /**
   * 추천 근거를 카드에서 보여 줄지. 추천 대응안이 있으면 그 행을 펼쳤을 때 보여 주므로 false다.
   * 추천 대응안이 하나도 없을 때만 true로 둬서 추천 근거 문장이 사라지지 않게 한다.
   */
  showRecommendation: boolean
}

/** AI 설명. 분석 전체를 풀어 쓴 참고 정보이며, 숫자는 위 비교표와 같은 값이다. 대응안별 설명은 비교표의 각 행에 있다. */
export function AiExplanationCard({ explanation, showRecommendation }: AiExplanationCardProps) {
  return (
    <section
      aria-labelledby="ai-explanation-title"
      className="flex flex-col gap-16pxr rounded-card bg-background p-20pxr"
    >
      <h3 id="ai-explanation-title" className="flex items-center gap-6pxr text-b1 font-bold">
        <Sparkles className="size-16pxr text-primary" aria-hidden="true" />
        AI 설명
        <span className="text-caption font-normal text-muted-foreground">참고 정보</span>
      </h3>

      <dl
        className={cn('grid gap-12pxr', showRecommendation ? 'md:grid-cols-3' : 'md:grid-cols-2')}
      >
        <ExplanationItem label="분석 요약" text={explanation.runSummary} />
        <ExplanationItem label="영향 요약" text={explanation.riskSummary} />
        {showRecommendation && (
          <ExplanationItem label="추천 근거" text={explanation.recommendation} />
        )}
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
