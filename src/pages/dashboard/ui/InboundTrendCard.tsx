import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  dashboardQueries,
  INBOUND_TREND_DAYS,
  type InboundTrendDays,
  type InboundTrendPoint,
} from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD } from '@/shared/lib/kst-date'
import { prefersReducedMotion } from '@/shared/lib/reduced-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { TREND_DAYS_OPTIONS } from '../model/dashboard'

// 실제로 일어난 값(실제 입고)은 실선과 면으로, 계획(입고 예정)은 점선으로 그린다
const ACTUAL_COLOR = 'var(--color-primary-600)'
const PLANNED_COLOR = 'var(--color-rose-500)'
const TICK_STYLE = { fontSize: '0.75rem', fill: 'var(--color-muted-foreground)' }
const CHART_ANIMATION_MS = 700

const formatSignedCount = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatNumber(Math.abs(value))}건`

export function InboundTrendCard() {
  const gradientId = useId()
  const [days, setDays] = useState<InboundTrendDays>(INBOUND_TREND_DAYS.WEEK)
  const { data, error, isFetching, isPlaceholderData, refetch } = useQuery(
    dashboardQueries.inboundTrend({ days }),
  )
  const points = data?.points ?? []
  const baseDate = points.at(-1)?.date
  const plannedTotal = points.reduce((sum, point) => sum + point.plannedCount, 0)
  const actualTotal = points.reduce((sum, point) => sum + point.actualCount, 0)
  const selectedIndex = TREND_DAYS_OPTIONS.findIndex((option) => option.days === days)
  const isAnimationActive = !prefersReducedMotion()

  return (
    <Card className="flex flex-col border-primary-100">
      <CardHeader>
        <CardTitle as="h2">최근 {days}일 3PL 입고 추이</CardTitle>
        <div
          role="group"
          aria-label="조회 기간"
          className="relative flex rounded-control bg-primary-50 p-4pxr"
        >
          {/* 선택한 기간으로 미끄러지는 표시 */}
          <span
            className="absolute inset-y-4pxr left-4pxr w-52pxr rounded-control bg-card shadow-[0_0.0625rem_0.25rem_rgb(89_67_184/0.25)] transition-transform duration-300 motion-reduce:transition-none"
            style={{ transform: `translateX(${selectedIndex * 100}%)` }}
            aria-hidden="true"
          />
          {TREND_DAYS_OPTIONS.map((option) => (
            <button
              key={option.days}
              type="button"
              aria-pressed={days === option.days}
              onClick={() => setDays(option.days)}
              className={cn(
                'relative w-52pxr cursor-pointer rounded-control py-4pxr text-b2 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30',
                days === option.days
                  ? 'font-bold text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-16pxr pt-16pxr">
        {/* 범례이면서 기간 합계다 */}
        <ul className="flex flex-wrap items-center gap-x-24pxr gap-y-4pxr text-b2 text-muted-foreground">
          <li className="flex items-center gap-6pxr">
            <SeriesKey dashed />
            입고 예정(계획일)
            {data && (
              <span className="text-b1 font-bold text-foreground">
                {formatNumber(plannedTotal)}건
              </span>
            )}
          </li>
          <li className="flex items-center gap-6pxr">
            <SeriesKey />
            실제 입고(실제 입고일)
            {data && (
              <span className="text-b1 font-bold text-foreground">
                {formatNumber(actualTotal)}건
              </span>
            )}
          </li>
        </ul>
        {!data ? (
          error ? (
            <QueryError
              message={error.message}
              loading={isFetching}
              onRetry={() => void refetch()}
            />
          ) : (
            <Skeleton className="h-280pxr rounded-card" />
          )
        ) : points.length === 0 ? (
          <p className="py-80pxr text-center text-muted-foreground">입고 추이 데이터가 없습니다.</p>
        ) : (
          <>
            <p className="text-caption text-muted-foreground">단위: 건(선적 수)</p>
            <div
              // 기간을 바꾸는 동안 이전 그래프를 흐리게 두어 틀이 흔들리지 않게 한다
              className={cn(
                'h-280pxr transition-opacity motion-reduce:transition-none',
                isPlaceholderData && 'opacity-50',
              )}
              role="img"
              aria-label={`최근 ${days}일 3PL 입고 추이 그래프, 기준일 ${baseDate ? formatMMDD(baseDate) : ''}. 입고 예정 합계 ${formatNumber(plannedTotal)}건, 실제 입고 합계 ${formatNumber(actualTotal)}건`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={ACTUAL_COLOR} stopOpacity={0.22} />
                      <stop offset="1" stopColor={ACTUAL_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatMMDD}
                    tick={TICK_STYLE}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={TICK_STYLE}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  {baseDate && (
                    <ReferenceLine
                      x={baseDate}
                      stroke="var(--color-input)"
                      strokeDasharray="2 3"
                      label={{
                        value: '기준일',
                        position: 'insideTopRight',
                        fontSize: '0.75rem',
                        fill: 'var(--color-muted-foreground)',
                      }}
                    />
                  )}
                  <Tooltip
                    content={TrendTooltip}
                    cursor={{ stroke: 'var(--color-input)', strokeDasharray: '3 3' }}
                  />
                  <Area
                    name="실제 입고"
                    dataKey="actualCount"
                    stroke={ACTUAL_COLOR}
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    dot={days === INBOUND_TREND_DAYS.WEEK}
                    activeDot={{ r: 5, stroke: 'var(--color-card)', strokeWidth: 2 }}
                    isAnimationActive={isAnimationActive}
                    animationDuration={CHART_ANIMATION_MS}
                  />
                  <Line
                    name="입고 예정"
                    dataKey="plannedCount"
                    stroke={PLANNED_COLOR}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    // 점선에 점을 찍으면 점 테두리까지 끊겨 보여서 찍지 않는다
                    dot={false}
                    activeDot={{ r: 5, stroke: 'var(--color-card)', strokeWidth: 2 }}
                    isAnimationActive={isAnimationActive}
                    animationDuration={CHART_ANIMATION_MS}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** 계열을 가리키는 짧은 선. 입고 예정은 그래프와 같이 점선이라 색을 못 가려도 구분된다 */
function SeriesKey({ dashed = false }: { dashed?: boolean }) {
  return (
    <span
      className={cn(
        'w-16pxr shrink-0 border-t-[0.1875rem]',
        dashed ? 'border-dashed border-rose-500' : 'border-primary-600',
      )}
      aria-hidden="true"
    />
  )
}

interface TrendTooltipProps {
  active?: boolean
  payload?: readonly { payload?: InboundTrendPoint }[]
}

/** 가리킨 날짜의 두 값과 차이를 함께 보여 준다 */
function TrendTooltip({ active, payload }: TrendTooltipProps) {
  const point = payload?.[0]?.payload

  if (!active || !point) {
    return null
  }
  return (
    <div className="flex min-w-144pxr flex-col gap-4pxr rounded-control border border-border bg-card p-12pxr text-caption shadow-[0_0.5rem_1.5rem_-0.5rem_rgb(37_35_49/0.25)]">
      <p className="text-muted-foreground">{formatMMDD(point.date)}</p>
      <p className="flex items-center gap-6pxr">
        <SeriesKey dashed />
        <span className="flex-1 text-muted-foreground">입고 예정</span>
        <span className="text-b1 font-bold">{formatNumber(point.plannedCount)}건</span>
      </p>
      <p className="flex items-center gap-6pxr">
        <SeriesKey />
        <span className="flex-1 text-muted-foreground">실제 입고</span>
        <span className="text-b1 font-bold">{formatNumber(point.actualCount)}건</span>
      </p>
      <p className="flex justify-between gap-6pxr border-t pt-4pxr text-muted-foreground">
        예정 대비
        <span className="font-bold text-foreground">
          {formatSignedCount(point.actualCount - point.plannedCount)}
        </span>
      </p>
    </div>
  )
}
