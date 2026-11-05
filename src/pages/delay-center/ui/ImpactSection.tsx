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

const NOT_ESTIMABLE_TEXT = '재고·판매 자료가 부족해 판정할 수 없습니다.'
const EMPTY = '—'

interface ImpactSectionProps {
  analysis: DelayAnalysis
}

/**
 * 상품(SKU·창고)별 재고 영향의 정확한 숫자와 날짜를 한 표로 보여 준다. 위쪽 지연 개요 카드의 날짜 축에는
 * 같은 순서로 상품별 위치만 그려져 있다. 판정할 수 없는 값은 '—'로 표시한다.
 */
export function ImpactSection({ analysis }: ImpactSectionProps) {
  const impacts = getVisibleImpacts(analysis.impacts)

  return (
    <section aria-labelledby="impact-title" className="flex flex-col gap-16pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h3 id="impact-title" className="text-h3 font-bold">
          상품별 재고 영향
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

      {impacts.length > 0 && <ImpactTable impacts={impacts} />}
    </section>
  )
}

const summaryText = ({ impacts, resultClass, riskOrders }: DelayAnalysis) => {
  switch (resultClass) {
    case RESULT_CLASS.FORECAST_ONLY_READY:
      return `실제 지연 유발 위험 주문 없음 · 지연 증분 예측 부족 ${getShortageSkuCount(impacts)}개 상품`
    case RESULT_CLASS.READY_ORDER_RISK:
      return `지연으로 인한 부족 증가분 ${getIncreasedShortage(impacts).toLocaleString()}개 · 위험 주문 ${riskOrders.length}건`
    case RESULT_CLASS.PURE_NO_RISK:
    case RESULT_CLASS.WARNING_NO_RISK:
      return RESULT_CLASS_LABEL[resultClass]
  }
}

const getImpactKey = ({ skuCode, region }: SkuImpact) => `${skuCode}-${region}`

function ImpactTable({ impacts }: { impacts: SkuImpact[] }) {
  return (
    <div className="overflow-x-auto">
      <Table density="compact" className="min-w-640pxr">
        <TableHeader>
          <TableRow>
            <TableHead>상품</TableHead>
            <TableHead className="w-120pxr">부족 증가분</TableHead>
            <TableHead className="w-110pxr">안전재고 하회</TableHead>
            <TableHead className="w-96pxr">재고 소진</TableHead>
            <TableHead className="w-96pxr">품절 일수</TableHead>
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
                  <TableCell
                    className={cn((impact.increasedShortage ?? 0) > 0 && 'font-bold text-danger')}
                  >
                    {(impact.increasedShortage ?? 0).toLocaleString()}개
                  </TableCell>
                  <TableCell>
                    {impact.safetyStockBreachDate
                      ? formatMonthDay(impact.safetyStockBreachDate)
                      : EMPTY}
                  </TableCell>
                  <TableCell>
                    {impact.stockoutDate ? formatMonthDay(impact.stockoutDate) : EMPTY}
                  </TableCell>
                  <TableCell>{impact.stockoutDays ? `${impact.stockoutDays}일` : EMPTY}</TableCell>
                </>
              ) : (
                <TableCell colSpan={4} className="text-warning">
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
