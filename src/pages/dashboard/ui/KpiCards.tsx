import { useQuery } from '@tanstack/react-query'
import { AlarmClock, CircleCheck, Package, ShoppingBag, type LucideIcon } from 'lucide-react'

import { dashboardQueries } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { Card, CardContent } from '@/shared/ui/card'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { KPI_ID, KPI_TONE, toKpis, type KpiId, type KpiTone } from '../model/kpi'

const TONE_CLASS: Record<KpiTone, string> = {
  [KPI_TONE.NEUTRAL]: 'text-muted-foreground',
  [KPI_TONE.GOOD]: 'text-success',
  [KPI_TONE.BAD]: 'text-danger',
}

const ICON: Record<KpiId, LucideIcon> = {
  [KPI_ID.IN_TRANSIT]: Package,
  [KPI_ID.DELAYED]: AlarmClock,
  [KPI_ID.ON_TIME]: CircleCheck,
  [KPI_ID.AT_RISK]: ShoppingBag,
}

const GRID_CLASS = 'grid gap-24pxr sm:grid-cols-2 xl:grid-cols-4'

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
              <Skeleton key={id} className="h-136pxr rounded-card" />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section aria-label="핵심 지표" className={GRID_CLASS}>
      {toKpis(data).map(({ id, label, value, caption, tone, isAlert }) => {
        const Icon = ICON[id]

        return (
          <Card key={id}>
            <CardContent className="flex flex-col gap-8pxr">
              <div className="flex items-center justify-between">
                <p className="text-b1 text-muted-foreground">{label}</p>
                <Icon className="size-18pxr text-muted-foreground" aria-hidden="true" />
              </div>
              <p className={cn('text-display font-bold', isAlert && 'text-danger')}>{value}</p>
              <p className={cn('text-b2', TONE_CLASS[tone])}>{caption}</p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
