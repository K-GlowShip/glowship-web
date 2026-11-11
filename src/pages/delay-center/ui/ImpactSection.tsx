import { type DelayAnalysis, type DelayCase, getVisibleImpacts } from '../model/delay-center'
import { DetailSubsection } from './DetailChapter'
import { ImpactAxis } from './ImpactAxis'
import { ImpactTable } from './ImpactTable'

interface ImpactSectionProps {
  analysis: DelayAnalysis
  delayCase: Pick<DelayCase, 'plannedInbound' | 'expectedInbound'>
}

/**
 * 재고 영향. 같은 상품들을 위에서는 날짜 축에 놓아 "언제 바닥나고 입고는 언제인가"를 보여 주고,
 * 아래 표에서 정확한 숫자와 날짜를 보여 준다. 둘의 상품 순서는 같다(가장 먼저 문제가 생기는 순서).
 * 합계(부족 수량·위험 주문)는 머리의 요약에 있어 여기서 반복하지 않는다.
 */
export function ImpactSection({ analysis, delayCase }: ImpactSectionProps) {
  const impacts = getVisibleImpacts(analysis.impacts)

  if (impacts.length === 0) {
    return null
  }
  return (
    <DetailSubsection
      id="impact-title"
      title="재고 영향"
      aside="가장 먼저 문제가 생기는 상품 순서입니다"
    >
      <ImpactAxis
        impacts={impacts}
        plannedInbound={delayCase.plannedInbound}
        expectedInbound={delayCase.expectedInbound}
      />
      <ImpactTable impacts={impacts} />
    </DetailSubsection>
  )
}
