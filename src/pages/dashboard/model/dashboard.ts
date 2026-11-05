import {
  DELAY_STATUS,
  type DelayStatus,
  type RegionCode,
  type StageCode,
} from '@/entities/delay-event'

/** 명세 v6.2 `GET /dashboard/summary` */
export interface DashboardSummary {
  inTransitShipmentCount: number
  /** 7일 전 같은 시각 대비 증감 건수 */
  weekOverWeek: number | null
  delayedShipmentCount: number
  /** 하루 전 대비 증감 건수 */
  dayOverDay: number | null
  /** 0~1. 최근 30일 입고 완료 선적이 0건이면 null */
  onTimeInboundRate: number | null
  /** 직전 30일 대비 차이(0~1 단위). 비교할 값이 없으면 null */
  monthOverMonth: number | null
  atRiskOrderCount: number
  /** 미출고 주문 대비 비율(0~1). 미출고 주문이 0건이면 null */
  atRiskOrderRate: number | null
  /** ISO 8601 UTC. 적재된 수집이 없으면 null */
  lastSyncedAt: string | null
}

/** 명세 v6.2 `GET /dashboard/inbound-trend`의 `days` */
export const TREND_DAYS = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90,
} as const

export type TrendDays = (typeof TREND_DAYS)[keyof typeof TREND_DAYS]

export const TREND_DAYS_OPTIONS = [
  { days: TREND_DAYS.WEEK, label: '7일' },
  { days: TREND_DAYS.MONTH, label: '30일' },
  { days: TREND_DAYS.QUARTER, label: '90일' },
] as const

export interface InboundTrendPoint {
  /** UTC 날짜 'YYYY-MM-DD' */
  date: string
  plannedCount: number
  actualCount: number
}

/** 명세 v6.2 `GET /data-sync-runs/latest`의 `status` */
export const SYNC_STATUS = {
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
  FAILED: 'FAILED',
} as const

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS]

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  RUNNING: '수집 중',
  SUCCEEDED: '정상',
  PARTIAL_SUCCESS: '일부 오류',
  FAILED: '수집 오류',
}

export const SYNC_STATUS_BADGE_VARIANT = {
  RUNNING: 'info',
  SUCCEEDED: 'success',
  PARTIAL_SUCCESS: 'warning',
  FAILED: 'danger',
} as const satisfies Record<SyncStatus, 'info' | 'success' | 'warning' | 'danger'>

/** 화면은 원천 시스템 단위로 묶는다(주문 = ERP, 재고 = WMS, 선적 = TMS) */
export interface SyncSourceStatus {
  sourceDomain: 'ORDER' | 'INVENTORY' | 'SHIPMENT'
  /** 표시명. 예: '주문' */
  name: string
  sourceSystemName: string
  status: SyncStatus
  /** ISO 8601 UTC. 수집한 적이 없으면 null */
  finishedAt: string | null
  openIssueCount: number
}

export interface SyncStatusResult {
  syncIntervalMinutes: number
  sources: SyncSourceStatus[]
}

/** 대시보드가 보여 주는 지연 상태와 표시 순서. 사용자가 해야 할 일이 있는 상태가 앞이다(`counts` 키 중 일부) */
export const DELAY_STATUS_ORDER = [
  DELAY_STATUS.READY,
  DELAY_STATUS.NEEDS_REANALYSIS,
  DELAY_STATUS.ON_HOLD,
  DELAY_STATUS.ANALYZING,
] as const

export type DelayCounts = Record<(typeof DELAY_STATUS_ORDER)[number], number>

/** 대시보드에 보여 주는 지연 수. `GET /delay-events`에 `size`로 보낸다 */
export const DELAY_PREVIEW_SIZE = 5

export interface DelayItem {
  delayEventId: string
  shipmentCode: string
  warehouseRegion: RegionCode
  /** 선적에서 수량이 가장 많은 SKU. 상세가 없으면 null */
  productName: string | null
  skuCount: number
  /** 명세 D13. 예: 'KR → LOS ANGELES' */
  route: string
  stage: StageCode
  /** UTC 날짜 'YYYY-MM-DD' */
  planned3plInboundDate: string
  expected3plInboundDate: string
  delayDays: number
  /** 현재 실행에 계산 결과가 없으면 null */
  atRiskOrderCount: number | null
  /** 현재 실행이 없으면 null */
  status: DelayStatus | null
}

export interface DelayListResult {
  totalCount: number
  counts: DelayCounts
  items: DelayItem[]
}

/** 명세 v6.2 `GET /inventory-status`의 `status` */
export const INVENTORY_STATUS = {
  OK: 'OK',
  CAUTION: 'CAUTION',
  RISK: 'RISK',
} as const

export type InventoryStatus = (typeof INVENTORY_STATUS)[keyof typeof INVENTORY_STATUS]

// 명세에 OK·CAUTION·RISK의 표시명이 없다. 시안의 '정상'·'주의'에 맞춰 '위험'을 붙인 제안값
export const INVENTORY_STATUS_LABEL: Record<InventoryStatus, string> = {
  OK: '정상',
  CAUTION: '주의',
  RISK: '위험',
}

export const INVENTORY_STATUS_BADGE_VARIANT = {
  OK: 'success',
  CAUTION: 'warning',
  RISK: 'danger',
} as const satisfies Record<InventoryStatus, 'success' | 'warning' | 'danger'>

export interface InventoryItem {
  warehouseId: string
  skuId: string
  warehouseRegion: RegionCode
  productName: string
  availableQuantity: number
  averageDailySales: number
  /** UTC 날짜 'YYYY-MM-DD'. 하루 판매량이 0이면 null */
  safetyStockBreachDate: string | null
  stockoutDate: string | null
  status: InventoryStatus
}

export interface InventoryStatusResult {
  /** 마지막 재고 일자. 계산 기준일은 이 날짜 + 1일이다 */
  inventoryDate: string
  /** 명세 U2: 일 판매량 평균 기간 */
  salesBasisDays: number
  safetyStockDays: number
  items: InventoryItem[]
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** 'YYYY-MM-DD'에 일수를 더한다 */
export const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY).toISOString().slice(0, 10)

/** 두 'YYYY-MM-DD' 사이의 일수(to - from) */
export const diffDays = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY)

/** 'YYYY-MM-DD' -> 'MM.DD'. 값이 없으면 '-' */
export const formatMonthDay = (date: string | null) => {
  if (!date) {
    return '-'
  }
  const [, month, day] = date.split('-')
  return month && day ? `${month}.${day}` : '-'
}
