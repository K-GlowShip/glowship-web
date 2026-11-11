import { cn } from '@/shared/lib/cn'

import { type AxisTick, isAxisEnd } from '../model/impact-axis'

interface AxisTicksProps {
  ticks: AxisTick[]
}

/** 날짜 축 맨 위의 날짜 눈금 줄 */
export function AxisTicks({ ticks }: AxisTicksProps) {
  return (
    <div className="flex h-22pxr" aria-hidden="true">
      {/* 아래 줄들이 상품별 재고라는 것을 알려 주는 머리글. 맨 아래 선적 입고 줄과 구분한다 */}
      <div className="w-(--axis-label) shrink-0 text-caption text-muted-foreground">상품 재고</div>
      <div className="relative flex-1">
        {ticks.map(({ day, percent, label }, index) => (
          <span
            key={day}
            className={cn(
              'absolute top-0 text-caption text-muted-foreground',
              isAxisEnd(percent) ? '-translate-x-full' : '-translate-x-1/2',
              // 좁은 화면에서는 글자가 겹치지 않게 눈금을 하나 걸러서 보여 준다
              index % 2 === 1 && 'max-lg:hidden',
            )}
            style={{ left: `${percent}%` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
