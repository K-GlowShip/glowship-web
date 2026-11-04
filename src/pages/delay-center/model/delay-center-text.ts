import { CLIENT_ROLE, type ClientRole } from './delay-center-code'

interface DecisionFormText {
  optionLabel: string
  textLabel: string
  textPlaceholder: string
  submit: string
}

/** 역할마다 달라지는 선택 폼 문구. 팀장은 최종 선택, 팀원은 의견·초안 저장이다. */
export const DECISION_FORM_TEXT = {
  [CLIENT_ROLE.LEAD]: {
    optionLabel: '최종 대응안',
    textLabel: '선택 이유',
    textPlaceholder: '이 대응안을 선택한 이유를 입력하세요.',
    submit: '최종 선택',
  },
  [CLIENT_ROLE.MEMBER]: {
    optionLabel: '선택한 대응안',
    textLabel: '의견',
    textPlaceholder: '동료와 팀장이 참고할 의견을 입력하세요.',
    submit: '의견·초안 저장',
  },
} as const satisfies Record<ClientRole, DecisionFormText>

/** 팀장이 고를 수 있는 대응안이 현재 계획 유지뿐일 때의 안내. 선택은 기록이라 실제 조치는 이유에 남기게 한다. */
export const ONLY_KEEP_PLAN_GUIDE =
  '실행 가능한 다른 대응안이 없어 현재 계획 유지만 선택할 수 있습니다. 실제로 다른 조치를 하실 경우 선택 이유에 적어 주세요.'

export const NO_OPTION_LABEL = '선택 안 함 (의견만 저장)'
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
  NO_FEASIBLE_OPTION:
    '계획 유지 외에 실행 가능한 대응안이 없습니다. 대응안별 불가 사유를 보고 직접 검토하세요.',
  MISSING_DATA:
    '운영 기준이나 필수 자료가 없어 판정하지 못한 대응안이 있습니다. 자료를 보완한 뒤 재분석을 요청하세요.',
} as const

export const DEFAULT_PROGRESS_STEP = '분석'

/** 서버가 값을 주지 않을 때 보여 주는 문구 */
export const EMPTY_TEXT = {
  PRODUCT: '상품 정보 없음',
  DATA_BASIS: '데이터 기준 시각 확인 불가',
  RUN_CODE: '분석 ID 없음',
} as const
