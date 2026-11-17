import { SHIPMENT_STAGE, type Shipment, type ShipmentStage } from '@/shared/api'

export const SHIPMENT_STAGE_BADGE_VARIANT = {
  [SHIPMENT_STAGE.PRE_DEPARTURE]: 'neutral',
  [SHIPMENT_STAGE.AT_SEA]: 'info',
  [SHIPMENT_STAGE.IN_AIR]: 'info',
  [SHIPMENT_STAGE.AT_PORT]: 'warning',
  [SHIPMENT_STAGE.RECEIVED]: 'success',
} as const satisfies Record<ShipmentStage, 'neutral' | 'info' | 'warning' | 'success'>

/** 지연 상태 말만. 입고 전은 "지연 위험", 입고 완료는 "지연 입고", 지연이 아니면 "정상". 일수는 따로 보여 주는 상세 서랍에서 쓴다 */
export const getShipmentDelayStatusLabel = ({ isDelayed, stage }: Shipment) => {
  if (!isDelayed) {
    return '정상'
  }
  return stage === SHIPMENT_STAGE.RECEIVED ? '지연 입고' : '지연 위험'
}

/** 지연 상태에 일수를 붙인 목록용 표시. 예: "지연 위험 6일". 지연이 아니면 "정상". */
export const getShipmentDelayLabel = (shipment: Shipment) =>
  shipment.isDelayed
    ? `${getShipmentDelayStatusLabel(shipment)} ${shipment.delayDays}일`
    : getShipmentDelayStatusLabel(shipment)
