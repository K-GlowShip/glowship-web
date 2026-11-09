import type { DashboardSummary } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'

export const KPI_ID = {
  IN_TRANSIT: 'in-transit',
  DELAYED: 'delayed',
  ON_TIME: 'on-time',
  AT_RISK: 'at-risk',
} as const

export type KpiId = (typeof KPI_ID)[keyof typeof KPI_ID]

/** 비교 문구의 의미. 색은 화면이 정한다. */
export const KPI_TONE = {
  NEUTRAL: 'NEUTRAL',
  GOOD: 'GOOD',
  BAD: 'BAD',
} as const

export type KpiTone = (typeof KPI_TONE)[keyof typeof KPI_TONE]

export interface Kpi {
  id: KpiId
  label: string
  value: string
  /** 이전 값과 비교한 문구. 비교할 값이 없으면 `EMPTY_VALUE` */
  caption: string
  tone: KpiTone
  /** 주의가 필요한 지표. 화면이 값을 붉게 강조한다 */
  isAlert: boolean
}

const formatSigned = (value: number, unit: string) =>
  `${value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value)}${unit}`

const formatPercent = (rate: number) => `${(rate * 100).toFixed(1)}%`

const formatCount = (count: number) => `${count}건`

/** 대시보드 요약(명세 4.4 `GET /dashboard/summary`)을 지표 카드에 보여 줄 값으로 바꾼다. */
export const toKpis = (summary: DashboardSummary): Kpi[] => {
  const { weekOverWeek, dayOverDay, monthOverMonth, atRiskOrderRate } = summary

  return [
    {
      id: KPI_ID.IN_TRANSIT,
      label: '진행 중인 선적',
      value: formatCount(summary.inTransitShipmentCount),
      caption:
        weekOverWeek === null ? EMPTY_VALUE : `전주 대비 ${formatSigned(weekOverWeek, '건')}`,
      tone: KPI_TONE.NEUTRAL,
      isAlert: false,
    },
    {
      id: KPI_ID.DELAYED,
      label: '지연 선적',
      value: formatCount(summary.delayedShipmentCount),
      caption: dayOverDay === null ? EMPTY_VALUE : `전일 대비 ${formatSigned(dayOverDay, '건')}`,
      tone: dayOverDay !== null && dayOverDay > 0 ? KPI_TONE.BAD : KPI_TONE.NEUTRAL,
      isAlert: summary.delayedShipmentCount > 0,
    },
    {
      id: KPI_ID.ON_TIME,
      label: '정시 입고율 (최근 30일)',
      value:
        summary.onTimeInboundRate === null ? EMPTY_VALUE : formatPercent(summary.onTimeInboundRate),
      caption:
        monthOverMonth === null
          ? EMPTY_VALUE
          : `직전 30일 대비 ${formatSigned(Number((monthOverMonth * 100).toFixed(1)), '%p')}`,
      tone:
        monthOverMonth !== null && monthOverMonth > 0
          ? KPI_TONE.GOOD
          : monthOverMonth !== null && monthOverMonth < 0
            ? KPI_TONE.BAD
            : KPI_TONE.NEUTRAL,
      isAlert: false,
    },
    {
      id: KPI_ID.AT_RISK,
      label: '위험 주문',
      value: formatCount(summary.atRiskOrderCount),
      caption:
        atRiskOrderRate === null ? EMPTY_VALUE : `미출고 주문의 ${formatPercent(atRiskOrderRate)}`,
      tone: KPI_TONE.NEUTRAL,
      isAlert: summary.atRiskOrderCount > 0,
    },
  ]
}
