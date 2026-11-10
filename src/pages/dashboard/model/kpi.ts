import type { DashboardSummary } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { formatNumber } from '@/shared/lib/format-number'

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

/** 비교값의 방향. 화살표 아이콘은 화면이 정한다. 방향이 없는 문구(비율 설명 등)는 `NONE` */
export const KPI_TREND = {
  UP: 'UP',
  DOWN: 'DOWN',
  FLAT: 'FLAT',
  NONE: 'NONE',
} as const

export type KpiTrend = (typeof KPI_TREND)[keyof typeof KPI_TREND]

export interface Kpi {
  id: KpiId
  label: string
  /** 화면에 크게 보여 주는 숫자. 계산할 수 없으면 null */
  value: number | null
  unit: string
  /** 값의 소수 자릿수 */
  fractionDigits: number
  /** 이전 값과 비교한 문구. 비교할 값이 없으면 `EMPTY_VALUE` */
  caption: string
  tone: KpiTone
  trend: KpiTrend
  /** 원형 게이지로 보여 주는 비율(0~1). 비율 지표가 아니거나 계산할 수 없으면 null */
  rate: number | null
  /** 주의가 필요한 지표. 화면이 값을 붉게 강조한다 */
  isAlert: boolean
}

const formatSigned = (value: number, unit: string) =>
  `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatNumber(Math.abs(value))}${unit}`

/** 소수 자릿수를 맞추되, 정확히 100이면 '100.0'이 아니라 '100'으로 쓴다 */
const toFixedExceptFull = (value: number, fractionDigits: number) => {
  const fixed = value.toFixed(fractionDigits)
  return Number(fixed) === 100 ? '100' : fixed
}

const formatPercent = (rate: number) => `${toFixedExceptFull(rate * 100, 1)}%`

const toTrend = (delta: number | null): KpiTrend =>
  delta === null
    ? KPI_TREND.NONE
    : delta > 0
      ? KPI_TREND.UP
      : delta < 0
        ? KPI_TREND.DOWN
        : KPI_TREND.FLAT

/** 지표 값을 자릿수에 맞춰 보여 준다. 숫자가 올라가는 중간값(소수)도 같은 모양으로 나온다 */
export const formatKpiValue = (value: number, fractionDigits: number) =>
  fractionDigits === 0 ? formatNumber(Math.round(value)) : toFixedExceptFull(value, fractionDigits)

/** 대시보드 요약(명세 4.4 `GET /dashboard/summary`)을 지표 카드에 보여 줄 값으로 바꾼다. */
export const toKpis = (summary: DashboardSummary): Kpi[] => {
  const { weekOverWeek, dayOverDay, monthOverMonth, onTimeInboundRate, atRiskOrderRate } = summary

  return [
    {
      id: KPI_ID.IN_TRANSIT,
      label: '진행 중인 선적',
      value: summary.inTransitShipmentCount,
      unit: '건',
      fractionDigits: 0,
      caption:
        weekOverWeek === null ? EMPTY_VALUE : `전주 대비 ${formatSigned(weekOverWeek, '건')}`,
      tone: KPI_TONE.NEUTRAL,
      trend: toTrend(weekOverWeek),
      rate: null,
      isAlert: false,
    },
    {
      id: KPI_ID.DELAYED,
      label: '지연 선적',
      value: summary.delayedShipmentCount,
      unit: '건',
      fractionDigits: 0,
      caption: dayOverDay === null ? EMPTY_VALUE : `전일 대비 ${formatSigned(dayOverDay, '건')}`,
      tone: dayOverDay !== null && dayOverDay > 0 ? KPI_TONE.BAD : KPI_TONE.NEUTRAL,
      trend: toTrend(dayOverDay),
      rate: null,
      isAlert: summary.delayedShipmentCount > 0,
    },
    {
      id: KPI_ID.ON_TIME,
      label: '정시 입고율 (최근 30일)',
      value: onTimeInboundRate === null ? null : onTimeInboundRate * 100,
      unit: '%',
      fractionDigits: 1,
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
      trend: toTrend(monthOverMonth),
      rate: onTimeInboundRate,
      isAlert: false,
    },
    {
      id: KPI_ID.AT_RISK,
      label: '위험 주문',
      value: summary.atRiskOrderCount,
      unit: '건',
      fractionDigits: 0,
      caption:
        atRiskOrderRate === null ? EMPTY_VALUE : `미출고 주문의 ${formatPercent(atRiskOrderRate)}`,
      tone: KPI_TONE.NEUTRAL,
      trend: KPI_TREND.NONE,
      rate: atRiskOrderRate,
      isAlert: summary.atRiskOrderCount > 0,
    },
  ]
}
