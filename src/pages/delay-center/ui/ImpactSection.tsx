import { cn } from '@/shared/lib/cn'

import { type DelayAnalysis, formatMonthDay } from '../model/delay-center'

interface Milestone {
  label: string
  value: string
  tone: 'warning' | 'danger' | 'info'
}

const TONE_CLASS = {
  warning: { text: 'text-warning', dot: 'bg-warning' },
  danger: { text: 'text-danger', dot: 'bg-danger' },
  info: { text: 'text-info', dot: 'bg-info' },
} as const satisfies Record<Milestone['tone'], { text: string; dot: string }>

interface ImpactSectionProps {
  analysis: DelayAnalysis
  expectedInbound: string
}

/** 안전재고 하회일과 실제 소진일을 나눠 보여 줘서, 여유가 줄어드는 시점과 팔 수 없게 되는 시점을 구분하게 한다. */
export function ImpactSection({ analysis, expectedInbound }: ImpactSectionProps) {
  const { impact, resultClass, riskOrders, forecastOnlySkuCount } = analysis

  const milestones: Milestone[] = []
  if (impact.safetyStockBreachDate) {
    milestones.push({
      label: '안전재고 하회',
      value: formatMonthDay(impact.safetyStockBreachDate),
      tone: 'warning',
    })
  }
  if (impact.stockoutDate) {
    milestones.push({
      label: '재고 소진',
      value: formatMonthDay(impact.stockoutDate),
      tone: 'danger',
    })
  }
  if (impact.stockoutDate && impact.stockoutEndDate) {
    milestones.push({
      label: `품절 예상 · ${impact.stockoutDays}일`,
      value: `${formatMonthDay(impact.stockoutDate)}–${impact.stockoutEndDate.slice(8)}`,
      tone: 'danger',
    })
  }
  milestones.push({ label: '예상 입고', value: formatMonthDay(expectedInbound), tone: 'info' })

  return (
    <section aria-labelledby="impact-title" className="flex flex-col gap-16pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h3 id="impact-title" className="text-h3 font-bold">
          재고 영향
        </h3>
        <p className="text-b2 text-danger">
          {resultClass === 'FORECAST_ONLY_READY'
            ? `실제 지연 유발 위험 주문 없음 · 지연 증분 예측 부족 ${forecastOnlySkuCount}개`
            : `지연으로 늘어난 부족 ${impact.increasedShortage.toLocaleString()}개 · 위험 주문 ${riskOrders.length}건`}
        </p>
      </div>

      <ol className="grid grid-cols-2 gap-16pxr md:grid-cols-4">
        {milestones.map((milestone) => (
          <li key={milestone.label} className="flex flex-col gap-6pxr">
            <span className={cn('text-b1 font-bold', TONE_CLASS[milestone.tone].text)}>
              {milestone.value}
            </span>
            <span className="relative h-2pxr bg-border" aria-hidden="true">
              <span
                className={cn(
                  'absolute -top-4pxr left-0 size-10pxr rounded-full',
                  TONE_CLASS[milestone.tone].dot,
                )}
              />
            </span>
            <span className="pt-4pxr text-b2 text-muted-foreground">{milestone.label}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
