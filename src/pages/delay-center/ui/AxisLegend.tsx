import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Tooltip } from '@/shared/ui/tooltip'

import { AXIS_LEGEND_TEXT } from '../model/delay-center-text'

// TODO: 서버 연동 후 재고 영향 응답의 `safetyStockDays`로 바꾼다 (명세 4.5, 안전재고 기준 14일)
const SAFETY_STOCK_DAYS = 14

interface AxisLegendProps {
  /** 그래프에 그리지 못해 아래 표에서만 보는 상품 수 */
  hiddenCount: number
}

/** 날짜 축 아래의 범례. 이름을 올리면 뜻을 보여 주고, 그래프에 없는 상품이 있으면 표를 안내한다. */
export function AxisLegend({ hiddenCount }: AxisLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-16pxr gap-y-4pxr text-caption text-muted-foreground">
      <LegendDot
        className="border-2 border-warning-mark bg-card"
        label="안전재고 하회"
        description={AXIS_LEGEND_TEXT.SAFETY_STOCK_BREACH(SAFETY_STOCK_DAYS)}
      />
      <LegendDot className="bg-danger" label="재고 소진" description={AXIS_LEGEND_TEXT.STOCKOUT} />
      <LegendItem
        label="품절 구간"
        description={AXIS_LEGEND_TEXT.STOCKOUT_SPAN}
        mark={<span className="h-10pxr w-20pxr rounded-full bg-danger-bg" aria-hidden="true" />}
      />
      {hiddenCount > 0 && (
        <span className="ml-auto">그 밖의 {hiddenCount}개 상품은 아래 표에서 확인하세요.</span>
      )}
    </div>
  )
}

interface LegendItemProps {
  label: string
  /** 마우스를 올리거나 포커스하면 보여 주는 설명 */
  description: string
  mark: ReactNode
}

/** 범례 한 칸. 이름에 점선 밑줄을 그어 설명이 있다는 걸 알리고, 이름을 올리면 뜻을 보여 준다. */
function LegendItem({ label, description, mark }: LegendItemProps) {
  return (
    <span className="flex items-center gap-6pxr">
      {mark}
      <Tooltip content={description}>
        <button
          type="button"
          className="cursor-help rounded-sm underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
        >
          {label}
        </button>
      </Tooltip>
    </span>
  )
}

function LegendDot({
  className,
  label,
  description,
}: {
  className: string
  label: string
  description: string
}) {
  return (
    <LegendItem
      label={label}
      description={description}
      mark={<span className={cn('size-10pxr rounded-full', className)} aria-hidden="true" />}
    />
  )
}
