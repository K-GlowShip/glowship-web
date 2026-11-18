import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { dashboardQueries, INBOUND_TREND_DAYS, type InboundTrendDays } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD } from '@/shared/lib/kst-date'
import { prefersReducedMotion } from '@/shared/lib/reduced-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { TREND_DAYS_OPTIONS } from '../model/dashboard'
import { toTrendBars, toTrendBucket, TREND_BUCKET_LABEL } from '../model/inbound-trend'
import { InboundTrendChart, SeriesKey } from './InboundTrendChart'

export function InboundTrendCard() {
  const [days, setDays] = useState<InboundTrendDays>(INBOUND_TREND_DAYS.QUARTER)
  const { data, error, isFetching, isPlaceholderData, refetch } = useQuery(
    dashboardQueries.inboundTrend({ days }),
  )
  const points = data?.points ?? []
  const bars = toTrendBars(points, days)
  const bucketLabel = TREND_BUCKET_LABEL[toTrendBucket(days)]
  const baseDate = formatMMDD(points.at(-1)?.date ?? null)
  const plannedTotal = points.reduce((sum, point) => sum + point.plannedCount, 0)
  const actualTotal = points.reduce((sum, point) => sum + point.actualCount, 0)
  const isEmptyPeriod = plannedTotal === 0 && actualTotal === 0
  const selectedIndex = TREND_DAYS_OPTIONS.findIndex((option) => option.days === days)
  const isAnimationActive = !prefersReducedMotion()

  return (
    <Card className="flex flex-col border-primary-100">
      <CardHeader className="flex-wrap gap-y-12pxr px-16pxr pt-20pxr web:px-24pxr web:pt-24pxr">
        <CardTitle as="h2" className="break-keep">
          최근 {days}일 3PL 입고 추이
        </CardTitle>
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
      <CardContent className="flex flex-col gap-16pxr px-16pxr pt-16pxr pb-16pxr web:p-24pxr">
        {/* 범례이면서 기간 합계다 */}
        <ul className="flex flex-wrap items-center gap-x-24pxr gap-y-4pxr text-b2 text-muted-foreground">
          <li className="flex items-center gap-6pxr">
            <SeriesKey planned />
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
        ) : isEmptyPeriod ? (
          <p className="py-80pxr text-center text-muted-foreground">
            이 기간에는 입고 예정과 실제 입고가 없습니다.
          </p>
        ) : (
          <>
            <p className="text-caption text-muted-foreground">
              단위: 건(선적 수) · {bucketLabel} · 기준일 {baseDate}
            </p>
            <div
              // 기간을 바꾸는 동안 이전 그래프를 흐리게 두어 틀이 흔들리지 않게 한다
              className={cn(
                '-mx-8pxr h-280pxr transition-opacity motion-reduce:transition-none web:mx-0',
                isPlaceholderData && 'opacity-50',
              )}
              role="img"
              aria-label={`최근 ${days}일 3PL 입고 추이 막대 그래프(${bucketLabel}), 기준일 ${baseDate}. 입고 예정 합계 ${formatNumber(plannedTotal)}건, 실제 입고 합계 ${formatNumber(actualTotal)}건`}
            >
              <InboundTrendChart bars={bars} isAnimationActive={isAnimationActive} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
