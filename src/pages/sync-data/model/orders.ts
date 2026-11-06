import {
  ORDER_STATUS,
  type OrderLine,
  type OrderStatus,
  SALES_CHANNEL,
  type SalesChannel,
} from '@/shared/api'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [ORDER_STATUS.OPEN]: '미출고',
  [ORDER_STATUS.PARTIALLY_SHIPPED]: '부분 출고',
  [ORDER_STATUS.SHIPPED]: '출고 완료',
  [ORDER_STATUS.DELIVERED]: '배송 완료',
  [ORDER_STATUS.CANCELLED]: '취소',
  [ORDER_STATUS.REMOVED_AT_SOURCE]: '원천 삭제',
}

export const ORDER_STATUS_BADGE_VARIANT = {
  [ORDER_STATUS.OPEN]: 'info',
  [ORDER_STATUS.PARTIALLY_SHIPPED]: 'warning',
  [ORDER_STATUS.SHIPPED]: 'success',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'neutral',
  [ORDER_STATUS.REMOVED_AT_SOURCE]: 'neutral',
} as const satisfies Record<OrderStatus, 'info' | 'success' | 'warning' | 'neutral'>

export const SALES_CHANNEL_LABEL: Record<SalesChannel, string> = {
  [SALES_CHANNEL.AMAZON]: 'Amazon',
  [SALES_CHANNEL.SEPHORA]: 'Sephora',
}

const LINE_STATUS_ACTIVE = 'ACTIVE'

export const getOrderLineStatusLabel = ({ lineStatus }: OrderLine) =>
  lineStatus === LINE_STATUS_ACTIVE ? '정상' : '원천 삭제'
