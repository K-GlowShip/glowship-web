import type { ClientRole } from './delay-center'

interface DecisionFormText {
  optionLabel: string
  textLabel: string
  textPlaceholder: string
  submit: string
}

/** 역할마다 달라지는 선택 폼 문구. 팀장은 최종 선택, 팀원은 의견·초안 저장이다. */
export const DECISION_FORM_TEXT = {
  lead: {
    optionLabel: '최종 대응안',
    textLabel: '선택 이유',
    textPlaceholder: '이 대응안을 선택한 이유를 입력하세요.',
    submit: '최종 선택',
  },
  member: {
    optionLabel: '선택한 대응안',
    textLabel: '의견',
    textPlaceholder: '동료와 팀장이 참고할 의견을 입력하세요.',
    submit: '의견·초안 저장',
  },
} as const satisfies Record<ClientRole, DecisionFormText>

export const NO_OPTION_LABEL = '선택 안 함 (의견만 저장)'
export const DRAFT_SAVED_MESSAGE = '의견·초안을 저장했습니다.'

/** 분석 상태에 따라 보여 주는 안내 문구 */
export const ANALYSIS_NOTICE = {
  STALE: '자료가 변경되었습니다. 재분석 후 선택하세요.',
  EXPLANATION_FAILED: '설명을 만들지 못해 이 분석은 선택할 수 없습니다. 재분석이 필요합니다.',
  IN_PROGRESS: '완료되면 대응안 비교와 선택 화면이 열립니다.',
  NO_RESULT: '분석 결과가 없습니다.',
  REANALYZE_GUIDE: '자료를 보완한 뒤 재분석을 요청하면 새 분석이 시작됩니다.',
} as const

export const DEFAULT_PROGRESS_STEP = '분석'

/** 서버가 값을 주지 않을 때 보여 주는 문구 */
export const EMPTY_TEXT = {
  PRODUCT: '상품 정보 없음',
  DATA_BASIS: '데이터 기준 시각 확인 불가',
} as const
