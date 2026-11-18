import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'

import { toTickInterval, toYAxisTicks, type TrendBar } from '../model/inbound-trend'

/**
 * 옛 선 그래프의 약속을 막대로 옮긴 색: 계획(입고 예정)은 점선 윤곽의 속 빈 막대, 실제 입고는 실선으로 채운 막대.
 * 윤곽은 primary-300이 흰 바탕 대비 1.8:1이라 쓰지 않고 500(4.7:1)을 쓴다
 */
const ACTUAL_COLOR = 'var(--color-primary-600)'
const FRAME_COLOR = 'var(--color-primary-500)'
const FRAME_FILL = 'var(--color-primary-50)'
const GRID_COLOR = 'var(--color-border)'
const TICK_STYLE = { fontSize: '0.75rem', fill: 'var(--color-muted-foreground)' }
const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: -16 }
const CHART_ANIMATION_MS = 700

const BAR_MAX_SIZE = 20
const FRAME_STROKE_WIDTH = 1.5
const FRAME_DASH = '3 3'

const formatSignedCount = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatNumber(Math.abs(value))}건`

interface FrameProps {
  x?: number
  y?: number
  width?: number
  height?: number
  /** recharts는 값 하나 또는 [시작, 끝] 구간을 준다 */
  value?: number | [number, number]
}

/** 점선 윤곽의 속 빈 막대(입고 예정). 0건이면 그리지 않는다 */
function DashedFrame({ x = 0, y = 0, width = 0, height = 0, value = 0 }: FrameProps) {
  const count = Array.isArray(value) ? value[1] - value[0] : value
  if (count <= 0 || height <= 0) {
    return null
  }
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={FRAME_FILL}
      stroke={FRAME_COLOR}
      strokeWidth={FRAME_STROKE_WIDTH}
      strokeDasharray={FRAME_DASH}
    />
  )
}

interface InboundTrendChartProps {
  bars: TrendBar[]
  isAnimationActive: boolean
}

/** 구간마다 왼쪽은 점선 틀(입고 예정), 오른쪽은 채운 막대(실제 입고) */
/** 호버한 구간의 배경. 토큰 색에 낮은 불투명도를 줘 뒤의 격자선이 비친다 */
const HOVER_CURSOR = { fill: 'var(--color-primary-600)', fillOpacity: 0.06 }

export function InboundTrendChart({ bars, isAnimationActive }: InboundTrendChartProps) {
  const [chartWidth, setChartWidth] = useState(0)
  const yTicks = toYAxisTicks(
    Math.max(...bars.map((bar) => Math.max(bar.plannedCount, bar.actualCount)), 0),
  )
  const yMax = yTicks[yTicks.length - 1]

  // 그래프는 바깥 래퍼가 role="img"와 설명으로 읽어 주므로, recharts가 만드는 포커스 대상(tabindex)과 클릭 때의 테두리는 끈다
  return (
    <ResponsiveContainer
      className="[&_*]:outline-none"
      width="100%"
      height="100%"
      onResize={(width) => setChartWidth(width)}
    >
      <BarChart
        accessibilityLayer={false}
        data={bars}
        margin={CHART_MARGIN}
        barCategoryGap="16%"
        barGap={3}
      >
        <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
        <XAxis
          dataKey="tick"
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={false}
          interval={toTickInterval(chartWidth, bars.length)}
        />
        <YAxis
          domain={[0, yMax]}
          ticks={yTicks}
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        {/* 호버 배경은 반투명이라 가로 구분선(격자)이 가려지지 않고 비쳐 보인다 */}
        <Tooltip content={TrendTooltip} cursor={HOVER_CURSOR} />
        <Bar
          name="입고 예정"
          dataKey="plannedCount"
          maxBarSize={BAR_MAX_SIZE}
          shape={(props: FrameProps) => <DashedFrame {...props} />}
          isAnimationActive={isAnimationActive}
          animationDuration={CHART_ANIMATION_MS}
        />
        <Bar
          name="실제 입고"
          dataKey="actualCount"
          fill={ACTUAL_COLOR}
          maxBarSize={BAR_MAX_SIZE}
          isAnimationActive={isAnimationActive}
          animationDuration={CHART_ANIMATION_MS}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** 계열을 가리키는 작은 막대. 그래프와 같은 모양이라 색을 못 가려도 옆의 글자와 함께 계열을 말한다 */
export function SeriesKey({ planned = false }: { planned?: boolean }) {
  return (
    <span
      className={cn(
        'h-10pxr w-10pxr shrink-0',
        planned
          ? 'border-[1.5px] border-dashed border-primary-500 bg-primary-50'
          : 'bg-primary-600',
      )}
      aria-hidden="true"
    />
  )
}

interface TrendTooltipProps {
  active?: boolean
  payload?: readonly { payload?: TrendBar }[]
}

/** 가리킨 구간의 두 값과 차이를 함께 보여 준다 */
function TrendTooltip({ active, payload }: TrendTooltipProps) {
  const bar = payload?.[0]?.payload

  if (!active || !bar) {
    return null
  }
  return (
    <div className="flex min-w-144pxr flex-col gap-4pxr rounded-control border border-border bg-card p-12pxr text-caption shadow-[0_0.5rem_1.5rem_-0.5rem_rgb(37_35_49/0.25)]">
      <p className="text-muted-foreground">
        {bar.rangeLabel}
        {bar.dayCount > 1 && ` · ${bar.dayCount}일`}
      </p>
      <p className="flex items-center gap-6pxr">
        <SeriesKey planned />
        <span className="flex-1 text-muted-foreground">입고 예정</span>
        <span className="text-b1 font-bold">{formatNumber(bar.plannedCount)}건</span>
      </p>
      <p className="flex items-center gap-6pxr">
        <SeriesKey />
        <span className="flex-1 text-muted-foreground">실제 입고</span>
        <span className="text-b1 font-bold">{formatNumber(bar.actualCount)}건</span>
      </p>
      <p className="flex justify-between gap-6pxr border-t pt-4pxr text-muted-foreground">
        예정 대비
        <span className="font-bold text-foreground">
          {formatSignedCount(bar.actualCount - bar.plannedCount)}
        </span>
      </p>
    </div>
  )
}
