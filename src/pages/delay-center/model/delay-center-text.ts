import { DECISION_TEXT } from '@/shared/config'

import { CLIENT_ROLE, type ClientRole } from './delay-center-code'

interface DecisionFormText {
  /** 대응안을 고르지 않았을 때 대응안 이름 자리에 보여 주는 문구 */
  noOption: string
  textLabel: string
  textPlaceholder: string
  submit: string
}

/** 역할마다 달라지는 선택 폼 문구. 팀장은 최종 선택, 팀원은 의견·초안 저장이다. */
export const DECISION_FORM_TEXT = {
  [CLIENT_ROLE.LEAD]: {
    noOption: '대응안 비교에서 카드를 눌러 선택해 주세요',
    textLabel: DECISION_TEXT.SELECTION_REASON,
    textPlaceholder: '이 대응안을 선택한 이유를 입력하세요.',
    submit: '최종 선택',
  },
  [CLIENT_ROLE.MEMBER]: {
    noOption: '선택 안 함',
    textLabel: DECISION_TEXT.OPINION,
    textPlaceholder: '동료와 팀장이 참고할 의견을 입력하세요.',
    submit: '의견·초안 저장',
  },
} as const satisfies Record<ClientRole, DecisionFormText>

/** 팀장이 고를 수 있는 대응안이 현재 계획 유지뿐일 때의 안내. 선택은 기록이라 실제 조치는 이유에 남기게 한다. */
export const ONLY_KEEP_PLAN_GUIDE =
  '실행 가능한 다른 대응안이 없어 현재 계획 유지만 선택할 수 있습니다. 실제로 다른 조치를 하실 경우 선택 이유에 적어 주세요.'

/** 선택은 판단 기록이고 실제 출고·운송을 실행하지 않는다(명세 4.6, BR-014) */
export const DECISION_RECORD_NOTICE = '선택은 판단 기록이며, 실제 출고·운송은 바뀌지 않습니다.'
export const DRAFT_SAVED_MESSAGE = '의견·초안을 저장했습니다.'

/** 분석 상태에 따라 보여 주는 안내 문구 */
export const ANALYSIS_NOTICE = {
  STALE: '자료가 변경되었습니다. 재분석 후 선택하세요.',
  EXPLANATION_FAILED: '설명을 만들지 못해 이 분석은 선택할 수 없습니다. 재분석이 필요합니다.',
  IN_PROGRESS: '완료되면 대응안 비교와 선택 화면이 열립니다.',
  NO_RESULT: '분석 결과가 없습니다.',
  REANALYZE_GUIDE: '자료를 보완한 뒤 재분석을 요청하면 새 분석이 시작됩니다.',
  ON_HOLD: '필수 자료 결손으로 분석을 보류했습니다.',
  NO_RISK: '현재 등록된 주문과 기준에서는 납기 위험 주문이 없습니다.',
  NO_DELAY: '예상 입고일이 계획 입고일 이전으로 돌아왔습니다.',
  CLOSED: '종료된 지연이라 대응안 선택과 재분석을 할 수 없습니다.',
  NO_DECIDE_ROLE: '대응안은 고객사 팀원·팀장 계정으로 선택할 수 있습니다.',
  CANNOT_DECIDE: '지금은 대응안을 선택할 수 없습니다. 위쪽 안내를 확인해 주세요.',
  NO_FEASIBLE_OPTION:
    '계획 유지 외에 실행 가능한 대응안이 없습니다. 대응안별 불가 사유를 보고 직접 검토하세요.',
  MISSING_DATA:
    '운영 기준이나 필수 자료가 없어 판정하지 못한 대응안이 있습니다. 자료를 보완한 뒤 재분석을 요청하세요.',
} as const

export const DEFAULT_PROGRESS_STEP = '분석'

/** 진행 중인 분석 실행 상태별 현재 단계 이름. 화면에서는 뒤에 ' 중'을 붙인다 */
export const PROGRESS_STEP_LABEL = {
  DETECTED: '지연 확인',
  VALIDATING: '입력 자료 검증',
  ANALYZING_IMPACT: '재고 영향 분석',
  ANALYZING_OPTIONS: '대응안 분석',
  VALIDATING_OUTPUT: '결과 검증',
} as const

/** 입력 확정 때 마지막 수집이 실패·지연이던 원천이 있을 때의 안내 */
export const DATA_WARNING_TEXT = (sourceLabels: string[]) =>
  `${sourceLabels.join('·')} 수집이 실패하거나 지연된 상태의 자료로 분석했습니다.`

/** 자료 변경으로 재분석이 필요해진 사유(`stalePrimaryReason`, 명세 4.5 STALE 사유). 모르는 코드는 사유를 보여 주지 않는다 */
export const STALE_REASON_LABEL: Record<string, string> = {
  RELEVANT_ORDER_CHANGED: '주문 데이터가 변경되었습니다.',
  RELEVANT_INVENTORY_CHANGED: '재고 데이터가 변경되었습니다.',
  RELEVANT_INBOUND_CHANGED: '입고 예정 데이터가 변경되었습니다.',
  RELEVANT_SKU_ATTRIBUTE_CHANGED: '상품 정보가 변경되었습니다.',
  DELAY_SCHEDULE_CHANGED: '지연 일정이 변경되었습니다.',
  DELAY_STAGE_CHANGED: '운송 단계가 변경되었습니다.',
  OPERATING_RULE_CHANGED: '운영 기준이 변경되었습니다.',
  TIME_ELAPSED: '분석 후 시간이 지났습니다.',
  MULTIPLE_RELEVANT_CHANGES: '여러 자료가 변경되었습니다.',
}

/** 서버가 값을 주지 않을 때 보여 주는 문구 */
export const EMPTY_TEXT = {
  PRODUCT: '상품 정보 없음',
  DATA_BASIS: '데이터 기준 시각 확인 불가',
  RUN_CODE: '분석 ID 없음',
} as const

/** 상품별 재고 영향 표의 안내 문구 */
export const IMPACT_TEXT = {
  // 명세 4.5 "재고 영향 읽는 법": 지연 증분 = 전체(예상 입고일) 부족 − 기준선(계획 입고일) 부족
  SHORTAGE_DESCRIPTION: [
    '지연 때문에 원래 계획보다 부족해진 수량입니다.',
    '계획대로 입고되어도 있었을 부족은 포함하지 않습니다.',
    '재고·미출고 확정 수량·최근 28일 평균 판매량으로 계산한 예측값입니다.',
    '산출식: (예상 입고일 기준 부족 수량) - (계획 입고일 기준 부족 수량)',
  ].join('\n'),
  // 명세 4.5: 일부 SKU만 판정 불가여도 실행은 계속되고, 판정 불가 SKU만 계산에서 빠진다. 자료를 보완한 뒤 재분석을 요청해야 반영된다
  NOT_ESTIMABLE:
    '재고·판매 자료가 부족해 판정할 수 없습니다. 자료를 보완한 뒤 재분석하면 반영됩니다.',
  NOT_ESTIMABLE_DESCRIPTION: [
    '이 상품은 계산에서 제외되어 요약의 부족 수량에도 들어가지 않습니다.',
    '나머지 상품의 결과로 대응안을 비교할 수 있습니다.',
  ].join('\n'),
} as const

/** 재고·입고 날짜 축 범례의 설명 문구 */
export const AXIS_LEGEND_TEXT = {
  SAFETY_STOCK_BREACH: (safetyStockDays: number) =>
    `안전재고는 평균 일 판매량의 ${safetyStockDays}일분입니다.\n이 날 전까지는 안전재고가 남아 있고, 이 날부터는 여유 없이 재고가 줄어듭니다.`,
  STOCKOUT: '가용 재고가 0이 되는 날',
  STOCKOUT_SPAN:
    '소진일부터 예상 입고 전까지의 구간. 그 사이 다른 선적이 입고되면 일부 날짜는 품절이 해소됩니다.',
} as const

/** 선택할 수 없는데 사유 코드도 없는 대응안에 보여 주는 문구 */
export const OPTION_NOT_SELECTABLE = '선택할 수 없는 대응안입니다.'
