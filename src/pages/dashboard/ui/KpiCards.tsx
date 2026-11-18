import { useQuery } from '@tanstack/react-query'
import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'

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
  [KPI_TONE.NEUTRAL]: 'text-muted-foreground',
  [KPI_TONE.GOOD]: 'text-success',
  [KPI_TONE.BAD]: 'text-danger',
}

const TREND_ICON: Record<KpiTrend, LucideIcon | null> = {
  [KPI_TREND.UP]: TrendingUp,
  [KPI_TREND.DOWN]: TrendingDown,
  [KPI_TREND.FLAT]: Minus,
  [KPI_TREND.NONE]: null,
}

// 지표를 상자에 담지 않고 요약 영역 위에 바로 놓는다. 가는 선으로만 나눠서 숫자가 주인공이 되게 한다
const GRID_CLASS =
  'grid grid-cols-2 gap-x-16pxr gap-y-20pxr border-t border-primary-900/10 pt-20pxr lg:grid-cols-4 lg:gap-y-24pxr lg:pt-24pxr'

// 지표 한 칸. 넓은 화면에서는 지표 사이를 세로선으로 나눈다. 모바일은 2×2로 두고 선 없이 간격만 둔다.
// 로딩 중 자리 표시도 같은 칸을 써서 지표가 도착해도 높이와 선이 달라지지 않는다
const ITEM_CLASS =
  'flex flex-col items-center gap-8pxr border-primary-900/10 text-center lg:items-start lg:pr-16pxr lg:text-left lg:border-l lg:pl-24pxr lg:first:border-l-0 lg:first:pl-0'

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
              <KpiSkeletonItem key={id} />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section aria-label="핵심 지표" className={GRID_CLASS}>
      {toKpis(data).map((kpi) => (
        <KpiItem key={kpi.id} kpi={kpi} />
      ))}
    </section>
  )
}

/** 지표 칸과 같은 세 줄(이름, 큰 숫자, 설명). 숫자 줄은 실제와 같은 글자 크기를 써서 화면 폭에 따라 높이가 함께 변한다 */
function KpiSkeletonItem() {
  return (
    <div className={ITEM_CLASS}>
      <Skeleton className="h-22pxr w-2/5 bg-white/60" />
      <Skeleton className="w-3/5 bg-white/60 text-kpi">&nbsp;</Skeleton>
      <Skeleton className="h-18pxr w-1/3 bg-white/60" />
    </div>
  )
}

function KpiItem({ kpi }: { kpi: Kpi }) {
  const { label, value, unit, fractionDigits, caption, tone, trend, isAlert } = kpi
  const TrendIcon = TREND_ICON[trend]

  return (
    <div className={ITEM_CLASS}>
      <p className="text-b2 text-muted-foreground">{label}</p>
      {/* 숫자는 크고 가늘게, 단위는 화장품 용량 표기처럼 숫자 머리 높이에 작게 올린다 */}
      <p
        className={cn(
          'flex items-start justify-center text-kpi font-light tracking-[-0.03em] tabular-nums lg:justify-start',
          isAlert && 'text-danger',
        )}
      >
        {value === null ? (
          EMPTY_VALUE
        ) : (
          <>
            <CountUp value={value} format={(current) => formatKpiValue(current, fractionDigits)} />
            {/* 위 여백을 숫자 크기에 비례(em)하게 줘서, 숫자가 커져도 단위가 숫자 머리에 맞는다 */}
            <span className="pt-[0.2em] pl-4pxr">
              <span className="block text-b1 font-normal tracking-normal text-muted-foreground">
                {unit}
              </span>
            </span>
          </>
        )}
      </p>
      <p
        className={cn(
          'flex items-center justify-center gap-4pxr text-caption lg:justify-start',
          TONE_CLASS[tone],
        )}
      >
        {TrendIcon && <TrendIcon className="size-14pxr" aria-hidden="true" />}
        {caption}
      </p>
    </div>
  )
}
