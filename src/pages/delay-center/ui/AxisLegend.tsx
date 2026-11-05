import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Tooltip } from '@/shared/ui/tooltip'

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
        className="bg-warning-mark"
        label="안전재고 하회"
        description={`안전재고는 평균 일 판매량의 ${SAFETY_STOCK_DAYS}일분입니다.\n이 날 전까지는 안전재고가 남아 있고, 이 날부터는 여유 없이 재고가 줄어듭니다.`}
      />
      <LegendDot className="bg-danger" label="재고 소진" description="가용 재고가 0이 되는 날" />
      <LegendItem
        label="품절 구간"
        description="소진일부터 예상 입고 전까지의 구간. 그 사이 다른 선적이 입고되면 일부 날짜는 품절이 해소됩니다."
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
