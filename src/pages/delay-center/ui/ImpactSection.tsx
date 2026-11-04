import { cn } from '@/shared/lib/cn'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import {
  type DelayAnalysis,
  formatMonthDay,
  getIncreasedShortage,
  getShortageSkuCount,
  getVisibleImpacts,
  RESULT_CLASS,
  RESULT_CLASS_LABEL,
  type SkuImpact,
  WAREHOUSE_LABEL,
} from '../model/delay-center'
import { TimelineTrack } from './TimelineTrack'

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

const EMPTY = '—'

/**
 * 재고 영향을 보여 준다. 가장 먼저 문제가 생기는 대표 상품은 안전재고 하회일과 실제 소진일을 구분한 타임라인으로,
 * 나머지 상품은 작은 표로 보여 줘서 상품이 많아도 상세가 길어지지 않게 한다.
 */
export function ImpactSection({ analysis, expectedInbound }: ImpactSectionProps) {
  const [leadImpact, ...otherImpacts] = getVisibleImpacts(analysis.impacts)

  return (
    <section aria-labelledby="impact-title" className="flex flex-col gap-16pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h3 id="impact-title" className="text-h3 font-bold">
          재고 영향
        </h3>
        <p
          className={cn(
            'text-b2',
            analysis.resultClass === RESULT_CLASS.PURE_NO_RISK ||
              analysis.resultClass === RESULT_CLASS.WARNING_NO_RISK
              ? 'text-muted-foreground'
              : 'text-danger',
          )}
        >
          {summaryText(analysis)}
        </p>
      </div>

      {leadImpact && <SkuImpactCard impact={leadImpact} expectedInbound={expectedInbound} />}
      {otherImpacts.length > 0 && <OtherImpactsTable impacts={otherImpacts} />}
    </section>
  )
}

const summaryText = ({ impacts, resultClass, riskOrders }: DelayAnalysis) => {
  switch (resultClass) {
    case RESULT_CLASS.FORECAST_ONLY_READY:
      return `실제 지연 유발 위험 주문 없음 · 지연 증분 예측 부족 ${getShortageSkuCount(impacts)}개 상품`
    case RESULT_CLASS.READY_ORDER_RISK:
      return `지연으로 늘어난 부족 ${getIncreasedShortage(impacts).toLocaleString()}개 · 위험 주문 ${riskOrders.length}건`
    case RESULT_CLASS.PURE_NO_RISK:
    case RESULT_CLASS.WARNING_NO_RISK:
      return RESULT_CLASS_LABEL[resultClass]
  }
}

const getImpactKey = ({ skuCode, region }: SkuImpact) => `${skuCode}-${region}`

function SkuImpactCard({
  impact,
  expectedInbound,
}: {
  impact: SkuImpact
  expectedInbound: string
}) {
  return (
    <div className="flex flex-col gap-16pxr rounded-card border border-border p-20pxr">
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
      {impact.estimable ? (
        <ImpactTimeline impact={impact} expectedInbound={expectedInbound} />
      ) : (
        <p className="text-b2 text-warning">{NOT_ESTIMABLE_TEXT}</p>
      )}
    </div>
  )
}

/** 대표 상품 말고 영향을 받는 상품들. 판정할 수 없는 값은 '—'로 표시한다. */
function OtherImpactsTable({ impacts }: { impacts: SkuImpact[] }) {
  return (
    <div className="overflow-x-auto">
      <Table density="compact" className="min-w-560pxr">
        <TableHeader>
          <TableRow>
            <TableHead>그 밖의 상품</TableHead>
            <TableHead className="w-120pxr">늘어난 부족</TableHead>
            <TableHead className="w-110pxr">안전재고 하회</TableHead>
            <TableHead className="w-96pxr">재고 소진</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {impacts.map((impact) => (
            <TableRow key={getImpactKey(impact)}>
              <TableCell>
                <span className="font-bold">{impact.productName}</span>{' '}
                <span className="text-muted-foreground">
                  {impact.skuCode} · {WAREHOUSE_LABEL[impact.region]}
                </span>
              </TableCell>
              {impact.estimable ? (
                <>
                  <TableCell>{(impact.increasedShortage ?? 0).toLocaleString()}개</TableCell>
                  <TableCell>
                    {impact.safetyStockBreachDate
                      ? formatMonthDay(impact.safetyStockBreachDate)
                      : EMPTY}
                  </TableCell>
                  <TableCell>
                    {impact.stockoutDate ? formatMonthDay(impact.stockoutDate) : EMPTY}
                  </TableCell>
                </>
              ) : (
                <TableCell colSpan={3} className="text-warning">
                  {NOT_ESTIMABLE_TEXT}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
    <ol className="grid auto-cols-fr grid-flow-col">
      {milestones.map((milestone, index) => (
        <li key={milestone.label} className="flex flex-col gap-6pxr">
          <span className={cn('pr-8pxr text-b1 font-bold', TONE_CLASS[milestone.tone].text)}>
            {milestone.value}
          </span>
          <TimelineTrack
            dotClassName={TONE_CLASS[milestone.tone].dot}
            lineClassName={index === milestones.length - 1 ? undefined : 'bg-border'}
          />
          <span className="pr-8pxr text-b2 text-muted-foreground">{milestone.label}</span>
        </li>
      ))}
    </ol>
  )
}
