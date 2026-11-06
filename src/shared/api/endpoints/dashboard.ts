import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import { ENDPOINT } from '../paths'

/** 대시보드 KPI와 비교값. 비교할 값이 없으면 `null`이다. */
export interface DashboardSummary {
  /** 기준 시각(고객사 마지막 적재 수집 완료 시각). 적재된 수집이 없으면 null. ISO 8601 UTC */
  lastSyncedAt: string | null
  inTransitShipmentCount: number
  /** 7일 전 대비 증감 건수 */
  weekOverWeek: number | null
  delayedShipmentCount: number
  /** 하루 전 대비 증감 건수 */
  dayOverDay: number | null
  /** 최근 30일 정시 입고율(0~1). 입고 완료 선적이 0건이면 null */
  onTimeInboundRate: number | null
  /** 직전 30일 대비 차이(0~1 단위) */
  monthOverMonth: number | null
  atRiskOrderCount: number
  /** 미출고 주문 대비 위험 주문 비율(0~1). 미출고 주문이 0건이면 null */
  atRiskOrderRate: number | null
}

export const getDashboardSummary = (config?: AxiosRequestConfig) =>
  API.get<DashboardSummary>(ENDPOINT.DASHBOARD.SUMMARY, config)

/** 입고 추이의 기간(일). 서버는 이 세 값만 받는다. */
export const INBOUND_TREND_DAYS = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90,
} as const

export type InboundTrendDays = (typeof INBOUND_TREND_DAYS)[keyof typeof INBOUND_TREND_DAYS]

export interface InboundTrendPoint {
  /** UTC 날짜 `YYYY-MM-DD`. 0건인 날도 포함된다 */
  date: string
  plannedCount: number
  actualCount: number
}

export interface InboundTrend {
  points: InboundTrendPoint[]
}

export interface GetInboundTrendParams {
  days: InboundTrendDays
}

export const getInboundTrend = (params: GetInboundTrendParams, config?: AxiosRequestConfig) =>
  API.get<InboundTrend>(ENDPOINT.DASHBOARD.INBOUND_TREND, { ...config, params })
