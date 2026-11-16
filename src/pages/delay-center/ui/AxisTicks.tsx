import { cn } from '@/shared/lib/cn'

import { type AxisTick, getAxisAlign } from '../model/impact-axis'

interface AxisTicksProps {
  ticks: AxisTick[]
}

const TICK_ALIGN_CLASS = {
  start: 'translate-x-0',
  center: '-translate-x-1/2',
  end: '-translate-x-full',
} as const

/** 날짜 축 맨 위의 날짜 눈금. 축 폭에 맞춰 놓이도록 부모가 날짜 영역 안에 둔다. */
export function AxisTicks({ ticks }: AxisTicksProps) {
  return (
    <div className="relative h-22pxr">
      {ticks.map(({ day, percent, label }, index) => (
        <span
          key={day}
          className={cn(
            'absolute top-0 text-caption text-muted-foreground',
            TICK_ALIGN_CLASS[getAxisAlign(percent)],
            // 좁은 화면에서는 글자가 겹치지 않게 눈금을 하나 걸러서 보여 준다
            index % 2 === 1 && 'max-lg:hidden',
          )}
          style={{ left: `${percent}%` }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}
