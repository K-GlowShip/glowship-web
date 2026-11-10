import { getOptionTypeLabel } from '@/entities/delay-event'
import type { Decision } from '@/shared/api'
import { DECISION_TEXT, EMPTY_VALUE } from '@/shared/config'

/** 선택한 대응안 표시명. 의견만 쓴 초안은 대응안이 없다. */
export const getDecisionOptionLabel = ({ responseOption }: Decision) =>
  responseOption ? getOptionTypeLabel(responseOption.optionType) : DECISION_TEXT.OPINION_ONLY

/** "선적 코드 / 상품명". 선적 상세가 없어 대표 상품을 알 수 없으면 선적 코드만 */
export const getDecisionTargetLabel = ({ shipment, representativeSku }: Decision) =>
  `${shipment.shipmentCode} / ${representativeSku?.productName ?? EMPTY_VALUE}`
