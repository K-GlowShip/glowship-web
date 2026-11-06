import { DELAY_STATUS } from '@/entities/delay-event'
import {
  type DelayEventCounts,
  INBOUND_TREND_DAYS,
  INVENTORY_STATUS,
  type InventoryStatus,
} from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'

export const TREND_DAYS_OPTIONS = [
  { days: INBOUND_TREND_DAYS.WEEK, label: '7일' },
  { days: INBOUND_TREND_DAYS.MONTH, label: '30일' },
  { days: INBOUND_TREND_DAYS.QUARTER, label: '90일' },
] as const

/** 대시보드가 보여 주는 지연 상태와 표시 순서. 사용자가 해야 할 일이 있는 상태가 앞이다(`counts` 키 중 일부) */
export const DELAY_STATUS_ORDER = [
  DELAY_STATUS.READY,
  DELAY_STATUS.NEEDS_REANALYSIS,
  DELAY_STATUS.ON_HOLD,
  DELAY_STATUS.ANALYZING,
] as const

/** 지연 상태 코드에 해당하는 `GET /delay-events` 응답 `counts`의 키 */
export const DELAY_COUNT_KEY: Record<(typeof DELAY_STATUS_ORDER)[number], keyof DelayEventCounts> =
  {
    [DELAY_STATUS.READY]: 'readyForReview',
    [DELAY_STATUS.NEEDS_REANALYSIS]: 'needsReanalysis',
    [DELAY_STATUS.ON_HOLD]: 'onHold',
    [DELAY_STATUS.ANALYZING]: 'analyzing',
  }

/** 대시보드에 보여 주는 지연 수. `GET /delay-events`에 `size`로 보낸다 */
export const DELAY_PREVIEW_SIZE = 5

/** 대시보드 재고 현황 표의 페이지 크기. 서버가 위험 순으로 정렬해 주므로 1페이지에 급한 행이 모인다 */
export const INVENTORY_PAGE_SIZE = 5

// 명세에 OK·CAUTION·RISK의 표시명이 없다. 시안의 '정상'·'주의'에 맞춰 '위험'을 붙인 제안값
export const INVENTORY_STATUS_LABEL: Record<InventoryStatus, string> = {
  [INVENTORY_STATUS.OK]: '정상',
  [INVENTORY_STATUS.CAUTION]: '주의',
  [INVENTORY_STATUS.RISK]: '위험',
}

export const INVENTORY_STATUS_BADGE_VARIANT = {
  [INVENTORY_STATUS.OK]: 'success',
  [INVENTORY_STATUS.CAUTION]: 'warning',
  [INVENTORY_STATUS.RISK]: 'danger',
} as const satisfies Record<InventoryStatus, 'success' | 'warning' | 'danger'>

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** 두 'YYYY-MM-DD' 사이의 일수(to - from) */
export const diffDays = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY)

/** 'YYYY-MM-DD' -> 'MM.DD'. 값이 없으면 `EMPTY_VALUE` */
export const formatMonthDay = (date: string | null) => {
  if (!date) {
    return EMPTY_VALUE
  }
  const [, month, day] = date.split('-')
  return month && day ? `${month}.${day}` : EMPTY_VALUE
}
