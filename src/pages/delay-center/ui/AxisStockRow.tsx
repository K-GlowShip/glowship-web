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
  /** 마지막 상품 줄이면 세로 연결선을 가지까지만 긋는다 */
  isLast: boolean
}

/**
 * 선적에 실린 상품 하나의 재고 줄. 안전재고 하회와 재고 소진 점, 품절 구간 띠를 그린다.
 * 라벨은 선적 줄보다 들여쓰고, 왼쪽의 세로 연결선에서 가지를 쳐서 "이 선적 안의 상품"으로 읽히게 한다.
 * 세로선은 줄마다 자기 높이만큼 긋고 마지막 줄은 가지까지만 그어서, 위에서부터 이어진 한 줄기로 보인다.
 */
export function AxisStockRow({
  impact,
  expectedInbound,
  toPercent,
  guides,
  isLast,
}: AxisStockRowProps) {
  const { productName, skuCode, safetyStockBreachDate, stockoutDate, stockoutDays } = impact
  const spanDays = stockoutDate ? getStockoutSpanDays(stockoutDate, expectedInbound) : 0

  return (
    <div className="flex h-32pxr items-center" aria-hidden="true">
      {/* 좁은 화면에서는 이름이 잘려 상품을 구분할 수 없어서 짧은 상품 코드를 보여 준다 */}
      <span
        className={cn(
          'relative flex h-full w-(--axis-label) shrink-0 items-center pr-12pxr pl-20pxr',
          'before:absolute before:top-0 before:bottom-0 before:left-4pxr before:w-px before:bg-input',
          'after:absolute after:top-1/2 after:left-4pxr after:w-10pxr after:border-t after:border-input',
          isLast && 'before:bottom-1/2',
        )}
        title={`${productName} (${skuCode})`}
      >
        <span className="min-w-0 truncate text-b2">
          <span className="web:hidden">{skuCode}</span>
          <span className="max-web:hidden">{productName}</span>
        </span>
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
        'absolute top-1/2 z-10 size-12pxr -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card',
        className,
      )}
      style={{ left: `${left}%` }}
      title={title}
    />
  )
}
