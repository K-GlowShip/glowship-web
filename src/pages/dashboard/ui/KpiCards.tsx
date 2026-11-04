import { AlarmClock, CircleCheck, Package, ShoppingBag, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Card, CardContent } from '@/shared/ui/card'

import type { DashboardSummary } from '../model/dashboard'

const TONE = {
  NEUTRAL: 'text-muted-foreground',
  GOOD: 'text-success',
  BAD: 'text-danger',
} as const

type Tone = (typeof TONE)[keyof typeof TONE]

interface Kpi {
  id: string
  label: string
  value: string
  caption: string
  tone: Tone
  icon: LucideIcon
  /** 주의가 필요한 지표는 아이콘과 값을 붉게 강조한다 */
  isAlert?: boolean
}

const formatSigned = (value: number, unit: string) =>
  `${value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value)}${unit}`

const formatPercent = (rate: number) => `${(rate * 100).toFixed(1)}%`

const formatCount = (count: number) => `${count}건`

const toKpis = (summary: DashboardSummary): Kpi[] => {
  const { inTransitWeekOverWeek, delayedDayOverDay, onTimeInboundMonthOverMonth, atRiskOrderRate } =
    summary

  return [
    {
      id: 'in-transit',
      label: '진행 중인 선적',
      value: formatCount(summary.inTransitShipmentCount),
      caption:
        inTransitWeekOverWeek === null
          ? '-'
          : `전주 대비 ${formatSigned(inTransitWeekOverWeek, '건')}`,
      tone: TONE.NEUTRAL,
      icon: Package,
    },
    {
      id: 'delayed',
      label: '지연 선적',
      value: formatCount(summary.delayedShipmentCount),
      caption:
        delayedDayOverDay === null ? '-' : `전일 대비 ${formatSigned(delayedDayOverDay, '건')}`,
      tone: delayedDayOverDay !== null && delayedDayOverDay > 0 ? TONE.BAD : TONE.NEUTRAL,
      icon: AlarmClock,
      isAlert: summary.delayedShipmentCount > 0,
    },
    {
      id: 'on-time',
      label: '정시 입고율 (최근 30일)',
      value: summary.onTimeInboundRate === null ? '-' : formatPercent(summary.onTimeInboundRate),
      caption:
        onTimeInboundMonthOverMonth === null
          ? '-'
          : `직전 30일 대비 ${formatSigned(Number((onTimeInboundMonthOverMonth * 100).toFixed(1)), '%p')}`,
      tone:
        onTimeInboundMonthOverMonth !== null && onTimeInboundMonthOverMonth > 0
          ? TONE.GOOD
          : onTimeInboundMonthOverMonth !== null && onTimeInboundMonthOverMonth < 0
            ? TONE.BAD
            : TONE.NEUTRAL,
      icon: CircleCheck,
    },
    {
      id: 'at-risk',
      label: '위험 주문',
      value: formatCount(summary.atRiskOrderCount),
      caption: atRiskOrderRate === null ? '-' : `미출고 주문의 ${formatPercent(atRiskOrderRate)}`,
      tone: TONE.NEUTRAL,
      icon: ShoppingBag,
      isAlert: summary.atRiskOrderCount > 0,
    },
  ]
}

export function KpiCards({ summary }: { summary: DashboardSummary }) {
  return (
    <section aria-label="핵심 지표" className="grid gap-24pxr sm:grid-cols-2 xl:grid-cols-4">
      {toKpis(summary).map(({ id, label, value, caption, tone, icon: Icon, isAlert }) => (
        <Card key={id}>
          <CardContent className="flex flex-col gap-8pxr">
            <div className="flex items-center justify-between">
              <p className="text-b1 text-muted-foreground">{label}</p>
              <Icon className="size-18pxr text-muted-foreground" aria-hidden="true" />
            </div>
            <p className={cn('text-display font-bold', isAlert && 'text-danger')}>{value}</p>
            <p className={cn('text-b2', tone)}>{caption}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
