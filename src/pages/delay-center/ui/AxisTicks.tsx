import { useCallback, useState } from 'react'

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

/** 이웃한 두 눈금 사이에 최소한 이만큼(px)은 있어야 글자('MM.DD' 약 34px)가 겹치지 않는다 */
const MIN_TICK_GAP = 56

/**
 * 축 폭에 맞춰 보여 줄 눈금만 고른다. 앞에서부터 간격이 모자라면 건너뛰고,
 * 맨 끝 눈금은 날짜 범위의 끝이라 항상 남기되 그 앞 눈금과 가까우면 앞 눈금을 뺀다.
 */
const pickVisibleTicks = (ticks: AxisTick[], width: number) => {
  if (width <= 0 || ticks.length <= 2) {
    return ticks
  }
  const gap = (a: AxisTick, b: AxisTick) => ((b.percent - a.percent) / 100) * width
  const last = ticks[ticks.length - 1]
  const kept = [ticks[0]]

  for (const tick of ticks.slice(1, -1)) {
    if (gap(kept[kept.length - 1], tick) >= MIN_TICK_GAP) {
      kept.push(tick)
    }
  }
  if (kept.length > 1 && gap(kept[kept.length - 1], last) < MIN_TICK_GAP) {
    kept.pop()
  }
  return gap(kept[kept.length - 1], last) >= MIN_TICK_GAP ? [...kept, last] : kept
}

/** 날짜 축 맨 위의 날짜 눈금. 축 폭에 맞춰 놓이도록 부모가 날짜 영역 안에 둔다. 좁으면 글자가 겹치지 않게 눈금을 덜어 낸다. */
export function AxisTicks({ ticks }: AxisTicksProps) {
  const [width, setWidth] = useState(0)

  // ref 콜백으로 크기를 지켜본다(useCallback이라 다시 그려도 관찰을 끊고 새로 걸지 않는다). 붙을 때 관찰을 시작하고, 반환한 함수가 뗄 때 해제한다(React 19).
  // 관찰 결과는 그리기 전에 전달되므로 눈금이 겹쳐 보였다 줄어드는 깜빡임이 없다
  const observeWidth = useCallback((element: HTMLDivElement) => {
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={observeWidth} className="relative h-22pxr">
      {pickVisibleTicks(ticks, width).map(({ day, percent, label }) => (
        <span
          key={day}
          className={cn(
            'absolute top-0 text-caption text-muted-foreground',
            TICK_ALIGN_CLASS[getAxisAlign(percent)],
          )}
          style={{ left: `${percent}%` }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}
