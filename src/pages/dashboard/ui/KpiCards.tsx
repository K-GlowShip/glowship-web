import { AlarmClock, CircleCheck, Package, ShoppingBag, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Card, CardContent } from '@/shared/ui/card'

import type { DashboardSummary } from '../model/dashboard'
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

export function KpiCards({ summary }: { summary: DashboardSummary }) {
  return (
    <section aria-label="핵심 지표" className="grid gap-24pxr sm:grid-cols-2 xl:grid-cols-4">
      {toKpis(summary).map(({ id, label, value, caption, tone, isAlert }) => {
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
