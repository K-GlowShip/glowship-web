import { formatNumber } from '@/shared/lib/format-number'

import { type DelayAnalysis, getVisibleImpacts } from '../model/delay-center'
import { type AxisShipment, countSkus, filterBreachingBeforeInbound } from '../model/impact-axis'
import { DetailSubsection } from './DetailChapter'
import { ImpactAxis } from './ImpactAxis'
import { ImpactTable } from './ImpactTable'

interface ImpactSectionProps {
  analysis: DelayAnalysis
  delayCase: AxisShipment
}

/**
 * SKU별 재고 영향. 위의 일정판은 이 선적(계획 입고 → 예상 입고) 아래에 실린 상품을 매달아 "언제 바닥나고 입고는 언제인가"를
 * 보여 주고, 아래 표는 정확한 숫자와 날짜를 보여 준다. 둘의 상품 순서는 같다(가장 먼저 문제가 생기는 순서).
 * 합계(부족 수량·위험 주문)는 머리의 요약에 있어 여기서 반복하지 않는다.
 */
export function ImpactSection({ analysis, delayCase }: ImpactSectionProps) {
  const impacts = getVisibleImpacts(analysis.impacts)

  if (impacts.length === 0) {
    return null
  }

  const breachingCount = countSkus(filterBreachingBeforeInbound(impacts, delayCase.expectedInbound))
  const skuCount = formatNumber(delayCase.skuCount)

  return (
    <DetailSubsection
      id="impact-title"
      title="SKU별 재고 영향"
      aside={
        breachingCount > 0
          ? `선적에 실린 상품 ${skuCount}종 중 ${formatNumber(breachingCount)}종이 예상 입고 전에 안전재고 아래로 내려갑니다`
          : `선적에 실린 상품 ${skuCount}종`
      }
    >
      <ImpactAxis impacts={impacts} shipment={delayCase} />
      <ImpactTable impacts={impacts} />
    </DetailSubsection>
  )
}
