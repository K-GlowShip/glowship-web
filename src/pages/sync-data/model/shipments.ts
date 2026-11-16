import { SHIPMENT_STAGE, type Shipment, type ShipmentStage } from '@/shared/api'

export const SHIPMENT_STAGE_BADGE_VARIANT = {
  [SHIPMENT_STAGE.PRE_DEPARTURE]: 'neutral',
  [SHIPMENT_STAGE.AT_SEA]: 'info',
  [SHIPMENT_STAGE.IN_AIR]: 'info',
  [SHIPMENT_STAGE.AT_PORT]: 'warning',
  [SHIPMENT_STAGE.RECEIVED]: 'success',
} as const satisfies Record<ShipmentStage, 'neutral' | 'info' | 'warning' | 'success'>

/** 입고 전은 "지연 위험", 입고 완료는 "지연 입고"로 구분한다. 지연이 아니면 "정상". */
export const getShipmentDelayLabel = ({ isDelayed, delayDays, stage }: Shipment) => {
  if (!isDelayed) {
    return '정상'
  }
  return `${stage === SHIPMENT_STAGE.RECEIVED ? '지연 입고' : '지연 위험'} ${delayDays}일`
}
