import { Sparkles, TriangleAlert } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { AiOriginalText } from '@/shared/ui/ai-original-text'

import type { AiExplanation } from '../model/delay-center'

interface AiExplanationCardProps {
  explanation: AiExplanation
  /**
   * 추천 근거를 여기서 보여 줄지. 추천 대응안이 있으면 그 카드에 보여 주므로 false다.
   * 추천 대응안이 하나도 없을 때만 true로 둬서 추천 근거 문장이 사라지지 않게 한다.
   */
  showRecommendation: boolean
}

/**
 * AI 설명. 분석 전체를 풀어 쓴 참고 정보이며, 숫자는 아래 대응안과 같은 값이다. 대응안별 설명은 각 대응안 카드에 있다.
 * 현재 상황 영역의 맨 끝(표와 그림을 다 본 뒤)에 두는 묶음이라 제목은 위 묶음(운송 단계·재고 영향)과 같은 크기로 맞추고,
 * 위와는 가는 선으로만 나눈다. 요약 문장은 본문보다 한 단계 큰 글자와 넉넉한 줄 간격으로 두어 빽빽하지 않게 읽힌다.
 */
export function AiExplanationCard({ explanation, showRecommendation }: AiExplanationCardProps) {
  // 서버 값으로 만든 쉬운 문장을 먼저 보여 주고, 만들 수 없는 칸은 AI 원문으로 대신한다. AI 원문은 아래에 접어 둔다
  const { plain } = explanation
  const warnings = plain.warnings.length > 0 ? plain.warnings : explanation.warnings
  const originals = [
    ...(plain.runSummary ? [{ label: '분석 요약', text: explanation.runSummary }] : []),
    ...(plain.impactSummary ? [{ label: '영향 요약', text: explanation.riskSummary }] : []),
    ...explanation.warnings.map((text) => ({ label: '경고', text })),
  ]

  return (
    <section
      aria-labelledby="ai-explanation-title"
      className="flex min-w-0 flex-col gap-20pxr border-t border-primary-900/10 pt-24pxr"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h4 id="ai-explanation-title" className="flex items-center gap-8pxr text-h3 font-bold">
          <Sparkles className="size-18pxr text-primary" aria-hidden="true" />
          AI 설명
        </h4>
        <p className="text-b2 text-muted-foreground">참고 정보</p>
      </div>

      <dl
        className={cn(
          'grid gap-y-20pxr',
          showRecommendation ? 'web:grid-cols-3' : 'web:grid-cols-2',
        )}
      >
        <ExplanationItem label="분석 요약" text={plain.runSummary ?? explanation.runSummary} />
        <ExplanationItem label="영향 요약" text={plain.impactSummary ?? explanation.riskSummary} />
        {showRecommendation && (
          <ExplanationItem label="추천 근거" text={explanation.recommendation} />
        )}
      </dl>

      {warnings.length > 0 && (
        <ul className="flex flex-col gap-8pxr border-t border-primary-900/10 pt-16pxr">
          {warnings.map((warning, index) => (
            // 같은 문구의 경고가 여러 번 올 수 있어서 순서를 key에 섞는다
            <li
              key={`${index}-${warning}`}
              className="flex items-start gap-8pxr text-b1 break-keep text-warning"
            >
              <TriangleAlert
                className="mt-3pxr size-16pxr shrink-0 text-warning-mark"
                aria-hidden="true"
              />
              {warning}
            </li>
          ))}
        </ul>
      )}

      <AiOriginalText items={originals} />
    </section>
  )
}

/** 요약 한 칸. 웹에서는 칸 사이를 가는 세로선으로 나누고, 모바일은 선 없이 세로로 쌓는다 */
function ExplanationItem({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-6pxr border-primary-900/10 web:border-l web:px-24pxr web:first:border-l-0 web:first:pl-0 web:last:pr-0">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-b1 break-keep text-foreground">{text}</dd>
    </div>
  )
}
