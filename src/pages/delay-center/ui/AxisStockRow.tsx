import { cn } from '@/shared/lib/cn'
import { formatMMDD } from '@/shared/lib/kst-date'

import { type SkuImpact } from '../model/delay-center'
import { getStockoutSpanDays } from '../model/impact-axis'
import { AxisGuides } from './AxisGuides'

interface AxisStockRowProps {
  impact: SkuImpact
  expectedInbound: string
  toPercent: (date: string) => number
  guides: number[]
}

/** 상품 하나의 재고 줄. 안전재고 하회와 재고 소진 점, 품절 구간 띠를 그린다. */
export function AxisStockRow({ impact, expectedInbound, toPercent, guides }: AxisStockRowProps) {
  const { productName, skuCode, safetyStockBreachDate, stockoutDate, stockoutDays } = impact
  const spanDays = stockoutDate ? getStockoutSpanDays(stockoutDate, expectedInbound) : 0

  return (
    <div className="flex h-32pxr items-center" aria-hidden="true">
      {/* 좁은 화면에서는 이름이 잘려 상품을 구분할 수 없어서 짧은 상품 코드를 보여 준다 */}
      <span
        className="w-(--axis-label) shrink-0 truncate pr-12pxr text-b2"
        title={`${productName} (${skuCode})`}
      >
        <span className="lg:hidden">{skuCode}</span>
        <span className="max-lg:hidden">{productName}</span>
      </span>
      <div className="relative h-full flex-1">
        <AxisGuides guides={guides} />
        <span className="absolute inset-x-0 top-1/2 h-2pxr -translate-y-1/2 bg-border" />
        {stockoutDate && !!stockoutDays && spanDays > 0 && (
          <span
            className="absolute top-1/2 h-14pxr -translate-y-1/2 rounded-full bg-danger-bg"
            style={{
              left: `${toPercent(stockoutDate)}%`,
              width: `${toPercent(expectedInbound) - toPercent(stockoutDate)}%`,
            }}
            title={
              stockoutDays < spanDays
                ? `품절 ${stockoutDays}일 (${formatMMDD(stockoutDate)}부터 입고 전까지 ${spanDays}일 중)`
                : `품절 ${stockoutDays}일 (${formatMMDD(stockoutDate)}부터)`
            }
          />
        )}
        {safetyStockBreachDate && (
          <Dot
            className="border-2 border-warning-mark bg-card"
            left={toPercent(safetyStockBreachDate)}
            title={`안전재고 하회 ${formatMMDD(safetyStockBreachDate)}`}
          />
        )}
        {stockoutDate && (
          <Dot
            className="bg-danger"
            left={toPercent(stockoutDate)}
            title={`재고 소진 ${formatMMDD(stockoutDate)}`}
          />
        )}
      </div>
    </div>
  )
}

function Dot({ className, left, title }: { className: string; left: number; title: string }) {
  return (
    <span
      className={cn(
        'absolute top-1/2 z-10 size-12pxr -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background',
        className,
      )}
      style={{ left: `${left}%` }}
      title={title}
    />
  )
}
