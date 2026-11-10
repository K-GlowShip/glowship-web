import { useQuery } from '@tanstack/react-query'
import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { useId, type CSSProperties } from 'react'

import { dashboardQueries } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { CountUp } from '@/shared/ui/count-up'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  formatKpiValue,
  KPI_ID,
  KPI_TONE,
  KPI_TREND,
  toKpis,
  type Kpi,
  type KpiTone,
  type KpiTrend,
} from '../model/kpi'

const TONE_CLASS: Record<KpiTone, string> = {
  [KPI_TONE.NEUTRAL]: 'bg-primary-50 text-muted-foreground',
  [KPI_TONE.GOOD]: 'bg-success-bg text-success',
  [KPI_TONE.BAD]: 'bg-danger-bg text-danger',
}

const TREND_ICON: Record<KpiTrend, LucideIcon | null> = {
  [KPI_TREND.UP]: TrendingUp,
  [KPI_TREND.DOWN]: TrendingDown,
  [KPI_TREND.FLAT]: Minus,
  [KPI_TREND.NONE]: null,
}

const GRID_CLASS = 'grid gap-16pxr sm:grid-cols-2 xl:grid-cols-4'

const RING_RADIUS = 22
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

export function KpiCards() {
  // 헤더의 기준 시각과 같은 요약 query다. 같은 키라서 요청은 한 번만 나간다
  const { data, error, isFetching, refetch } = useQuery(dashboardQueries.summary())

  if (!data) {
    return (
      <section aria-label="핵심 지표">
        {error ? (
          <QueryError message={error.message} loading={isFetching} onRetry={() => void refetch()} />
        ) : (
          <div className={GRID_CLASS}>
            {Object.values(KPI_ID).map((id) => (
              <Skeleton key={id} className="h-144pxr rounded-card bg-white/70" />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section aria-label="핵심 지표" className={GRID_CLASS}>
      {toKpis(data).map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  )
}

/** 비율(0~1)을 채워지는 원으로 보여 준다. 값은 옆의 숫자가 말하므로 장식으로 둔다 */
function RateRing({ rate, isAlert }: { rate: number; isAlert: boolean }) {
  const gradientId = useId()
  const filled = Math.min(Math.max(rate, 0), 1)

  return (
    <svg viewBox="0 0 56 56" className="size-56pxr shrink-0 -rotate-90" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-primary-500)" />
          <stop offset="1" stopColor="var(--color-rose-500)" />
        </linearGradient>
      </defs>
      <circle
        cx="28"
        cy="28"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="6"
        stroke={isAlert ? 'var(--color-danger-bg)' : 'var(--color-primary-100)'}
      />
      {filled > 0 && (
        <circle
          cx="28"
          cy="28"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          stroke={isAlert ? 'var(--color-danger)' : `url(#${gradientId})`}
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - filled)}
          className="animate-ring-fill motion-reduce:animate-none"
          style={{ '--ring-length': RING_LENGTH } as CSSProperties}
        />
      )}
    </svg>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const { label, value, unit, fractionDigits, caption, tone, trend, rate, isAlert } = kpi
  const TrendIcon = TREND_ICON[trend]

  return (
    <div className="flex flex-col gap-8pxr rounded-card border border-white bg-white/70 p-20pxr shadow-[0_0.5rem_1.5rem_-1rem_rgb(89_67_184/0.45)] backdrop-blur-md">
      <p className="text-b1 text-muted-foreground">{label}</p>
      <div className="flex items-end justify-between gap-12pxr">
        <div className="flex min-w-0 flex-col gap-8pxr">
          <p className={cn('text-display font-bold tabular-nums', isAlert && 'text-danger')}>
            {value === null ? (
              EMPTY_VALUE
            ) : (
              <>
                <CountUp
                  value={value}
                  format={(current) => formatKpiValue(current, fractionDigits)}
                />
                <span className="ml-2pxr text-h3">{unit}</span>
              </>
            )}
          </p>
          {caption === EMPTY_VALUE ? (
            <p className="text-b2 text-muted-foreground">{caption}</p>
          ) : (
            <p
              className={cn(
                'inline-flex items-center gap-4pxr self-start rounded-full px-10pxr py-2pxr text-caption font-bold',
                TONE_CLASS[tone],
              )}
            >
              {TrendIcon && <TrendIcon className="size-14pxr" aria-hidden="true" />}
              {caption}
            </p>
          )}
        </div>
        {rate !== null && <RateRing rate={rate} isAlert={isAlert} />}
      </div>
    </div>
  )
}
