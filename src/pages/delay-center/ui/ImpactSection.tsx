import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

import {
  type DelayAnalysis,
  formatMonthDay,
  getIncreasedShortage,
  getShortageSkuCount,
  getVisibleImpacts,
  RESULT_CLASS_LABEL,
  type SkuImpact,
  WAREHOUSE_LABEL,
} from '../model/delay-center'

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

const NOT_ESTIMABLE_TEXT = '재고·판매 자료가 부족해 판정할 수 없습니다.'

interface ImpactSectionProps {
  analysis: DelayAnalysis
  expectedInbound: string
}

/** 재고 영향을 상품(SKU·창고)별로 나눠 보여 준다. 상품마다 안전재고 하회일과 실제 소진일을 구분한다. */
export function ImpactSection({ analysis, expectedInbound }: ImpactSectionProps) {
  const impacts = getVisibleImpacts(analysis.impacts)

  return (
    <section aria-labelledby="impact-title" className="flex flex-col gap-16pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h3 id="impact-title" className="text-h3 font-bold">
          재고 영향
        </h3>
        <p
          className={cn(
            'text-b2',
            analysis.resultClass === 'PURE_NO_RISK' || analysis.resultClass === 'WARNING_NO_RISK'
              ? 'text-muted-foreground'
              : 'text-danger',
          )}
        >
          {summaryText(analysis)}
        </p>
      </div>

      <ul className="flex flex-col gap-12pxr">
        {impacts.map((impact) => (
          <SkuImpactItem
            key={`${impact.skuCode}-${impact.region}`}
            impact={impact}
            visual={<ImpactTimeline impact={impact} expectedInbound={expectedInbound} />}
          />
        ))}
      </ul>
    </section>
  )
}

const summaryText = ({ impacts, resultClass, riskOrders }: DelayAnalysis) => {
  switch (resultClass) {
    case 'FORECAST_ONLY_READY':
      return `실제 지연 유발 위험 주문 없음 · 지연 증분 예측 부족 ${getShortageSkuCount(impacts)}개 상품`
    case 'READY_ORDER_RISK':
      return `지연으로 늘어난 부족 ${getIncreasedShortage(impacts).toLocaleString()}개 · 위험 주문 ${riskOrders.length}건`
    case 'PURE_NO_RISK':
    case 'WARNING_NO_RISK':
      return RESULT_CLASS_LABEL[resultClass]
  }
}

interface SkuImpactItemProps {
  impact: SkuImpact
  /** 상품의 재고 영향을 그리는 영역. 지금은 타임라인이고, 지도로 바꿀 수 있게 슬롯으로 둔다. */
  visual: ReactNode
}

function SkuImpactItem({ impact, visual }: SkuImpactItemProps) {
  return (
    <li className="flex flex-col gap-16pxr rounded-card border border-border p-20pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <p className="flex min-w-0 items-baseline gap-8pxr">
          <span className="truncate text-b1 font-bold">{impact.productName}</span>
          <span className="shrink-0 text-b2 text-muted-foreground">
            {impact.skuCode} · {WAREHOUSE_LABEL[impact.region]}
          </span>
        </p>
        {impact.estimable && (
          <p className="text-b2 text-muted-foreground">
            지연으로 늘어난 부족{' '}
            <span className={cn('font-bold', (impact.increasedShortage ?? 0) > 0 && 'text-danger')}>
              {(impact.increasedShortage ?? 0).toLocaleString()}개
            </span>
          </p>
        )}
      </div>
      {impact.estimable ? visual : <p className="text-b2 text-warning">{NOT_ESTIMABLE_TEXT}</p>}
    </li>
  )
}

function ImpactTimeline({
  impact,
  expectedInbound,
}: {
  impact: SkuImpact
  expectedInbound: string
}) {
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
  )
}
