/** 대응안 실행 가능 여부 코드값(API 명세 v6.2 2절). 지연 대응 센터와 의사결정 이력이 함께 쓴다. */
export const FEASIBILITY = {
  FEASIBLE: 'FEASIBLE',
  NOT_FEASIBLE: 'NOT_FEASIBLE',
  NEEDS_CHECK: 'NEEDS_CHECK',
} as const

export type Feasibility = (typeof FEASIBILITY)[keyof typeof FEASIBILITY]

// 표시명은 API 명세 2절 라벨 사전(labels/ko-v1)을 그대로 쓴다.
export const FEASIBILITY_LABEL: Record<Feasibility, string> = {
  [FEASIBILITY.FEASIBLE]: '실행 가능',
  [FEASIBILITY.NOT_FEASIBLE]: '실행 불가',
  [FEASIBILITY.NEEDS_CHECK]: '확인 필요',
}

export const FEASIBILITY_BADGE_VARIANT = {
  [FEASIBILITY.FEASIBLE]: 'success',
  [FEASIBILITY.NOT_FEASIBLE]: 'danger',
  [FEASIBILITY.NEEDS_CHECK]: 'warning',
} as const satisfies Record<Feasibility, 'success' | 'danger' | 'warning'>

/** 대응안이 실행 불가·확인 필요인 사유 코드값(API 명세 v6.2 2절) */
export const REASON_CODE = {
  ARRIVES_AFTER_DELAYED_SHIPMENT: 'ARRIVES_AFTER_DELAYED_SHIPMENT',
  NO_KR_ELIGIBLE_STOCK: 'NO_KR_ELIGIBLE_STOCK',
  NO_TRANSFERABLE_STOCK: 'NO_TRANSFERABLE_STOCK',
  PROMISE_UNREACHABLE_LEADTIME: 'PROMISE_UNREACHABLE_LEADTIME',
  DONOR_NO_NEXT_INBOUND: 'DONOR_NO_NEXT_INBOUND',
  FORECAST_EFFECT_BELOW_ONE_UNIT: 'FORECAST_EFFECT_BELOW_ONE_UNIT',
  NO_RECOVERY_EFFECT: 'NO_RECOVERY_EFFECT',
  MISSING_OPERATING_RULE: 'MISSING_OPERATING_RULE',
  MISSING_REQUIRED_DATA: 'MISSING_REQUIRED_DATA',
} as const

export type ReasonCode = (typeof REASON_CODE)[keyof typeof REASON_CODE]

export const REASON_LABEL: Record<ReasonCode, string> = {
  [REASON_CODE.ARRIVES_AFTER_DELAYED_SHIPMENT]: '지연 선적보다 늦게 도착',
  [REASON_CODE.NO_KR_ELIGIBLE_STOCK]: '한국 창고에 보충할 재고 없음',
  [REASON_CODE.NO_TRANSFERABLE_STOCK]: '공여 창고에 넘길 재고 없음',
  [REASON_CODE.PROMISE_UNREACHABLE_LEADTIME]: '배송 기간 안에 약속일을 맞출 수 없음',
  [REASON_CODE.DONOR_NO_NEXT_INBOUND]: '공여 창고의 다음 입고 없음',
  [REASON_CODE.FORECAST_EFFECT_BELOW_ONE_UNIT]: '효과가 1개 미만',
  [REASON_CODE.NO_RECOVERY_EFFECT]: '회복 효과 없음',
  [REASON_CODE.MISSING_OPERATING_RULE]: '운영 기준 없음',
  [REASON_CODE.MISSING_REQUIRED_DATA]: '필수 자료 없음',
}

/** 서버가 새 값을 추가해도 화면이 깨지지 않게, 라벨이 없으면 코드를 그대로 보여 준다. */
export const getFeasibilityLabel = (feasibility: string) =>
  FEASIBILITY_LABEL[feasibility as Feasibility] ?? feasibility

export const getFeasibilityBadgeVariant = (feasibility: string) =>
  FEASIBILITY_BADGE_VARIANT[feasibility as Feasibility] ?? 'neutral'

export const getReasonLabel = (reasonCode: string) =>
  REASON_LABEL[reasonCode as ReasonCode] ?? reasonCode
