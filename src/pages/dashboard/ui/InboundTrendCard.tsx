import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { dashboardQueries, INBOUND_TREND_DAYS, type InboundTrendDays } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { formatMonthDay, TREND_DAYS_OPTIONS } from '../model/dashboard'

const PLANNED_COLOR = 'var(--color-primary-600)'
const ACTUAL_COLOR = 'var(--color-rose-500)'
const TICK_STYLE = { fontSize: '0.75rem', fill: 'var(--color-muted-foreground)' }

export function InboundTrendCard() {
  const [days, setDays] = useState<InboundTrendDays>(INBOUND_TREND_DAYS.WEEK)
  const { data, error, isFetching, refetch } = useQuery(dashboardQueries.inboundTrend({ days }))
  const points = data?.points ?? []
  const baseDate = points.at(-1)?.date
  const plannedTotal = points.reduce((sum, point) => sum + point.plannedCount, 0)
  const actualTotal = points.reduce((sum, point) => sum + point.actualCount, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle as="h2">최근 {days}일 3PL 입고 추이</CardTitle>
        <div role="group" aria-label="조회 기간" className="flex gap-4pxr">
          {TREND_DAYS_OPTIONS.map((option) => (
            <button
              key={option.days}
              type="button"
              aria-pressed={days === option.days}
              onClick={() => setDays(option.days)}
              className={cn(
                'cursor-pointer rounded-control px-12pxr py-4pxr text-b2 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30',
                days === option.days
                  ? 'bg-primary-100 font-bold text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-16pxr pt-16pxr">
        <ul className="flex flex-wrap items-center gap-x-16pxr gap-y-4pxr text-b2 text-muted-foreground">
          <li className="flex items-center gap-6pxr">
            <span className="h-3pxr w-16pxr rounded-full bg-primary-600" aria-hidden="true" />
            입고 예정(계획일)
          </li>
          <li className="flex items-center gap-6pxr">
            <span className="h-3pxr w-16pxr rounded-full bg-rose-500" aria-hidden="true" />
            실제 입고(실제 입고일)
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
              className="h-280pxr"
              role="img"
              aria-label={`최근 ${days}일 3PL 입고 추이 선 그래프, 기준일 ${baseDate ? formatMonthDay(baseDate) : ''}. 입고 예정 합계 ${plannedTotal}건, 실제 입고 합계 ${actualTotal}건`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatMonthDay}
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
                    labelFormatter={(label) => formatMonthDay(String(label))}
                    formatter={(value, name) => [`${value}건`, name]}
                  />
                  <Line
                    name="입고 예정"
                    dataKey="plannedCount"
                    stroke={PLANNED_COLOR}
                    strokeWidth={2}
                    dot={days === INBOUND_TREND_DAYS.WEEK}
                    isAnimationActive={false}
                  />
                  <Line
                    name="실제 입고"
                    dataKey="actualCount"
                    stroke={ACTUAL_COLOR}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={days === INBOUND_TREND_DAYS.WEEK}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
