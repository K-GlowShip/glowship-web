import { type DelayAnalysis, getVisibleImpacts } from '../model/delay-center'
import { ImpactSummary } from './ImpactSummary'
import { ImpactTable } from './ImpactTable'

interface ImpactSectionProps {
  analysis: DelayAnalysis
}

/**
 * 상품(SKU·창고)별 재고 영향의 정확한 숫자와 날짜를 한 표로 보여 준다. 위쪽 지연 개요 카드의 날짜 축에는
 * 같은 순서로 상품별 위치만 그려져 있다. 판정할 수 없는 값은 빈 값 문자로 표시한다.
 */
export function ImpactSection({ analysis }: ImpactSectionProps) {
  const impacts = getVisibleImpacts(analysis.impacts)

  return (
    <section aria-labelledby="impact-title" className="flex flex-col gap-16pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h3 id="impact-title" className="text-h3 font-bold">
          상품별 재고 영향
        </h3>
        <p className="text-b2 text-muted-foreground">
          <ImpactSummary analysis={analysis} />
        </p>
      </div>

      {impacts.length > 0 && <ImpactTable impacts={impacts} />}
    </section>
  )
}
