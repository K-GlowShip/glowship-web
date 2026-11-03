import type { ClientRole } from './delay-center'

const DECISION_ERROR_MESSAGE = {
  OPTION_REQUIRED: '대응안을 선택해주세요.',
  REASON_REQUIRED: '선택 이유를 입력해주세요.',
  OPTION_OR_OPINION_REQUIRED: '대응안이나 의견 중 하나는 입력해주세요.',
} as const

interface DecisionValues {
  optionId: string
  text: string
}

/**
 * 팀장의 최종 선택은 대응안과 이유가 모두 필요하고,
 * 팀원의 초안은 대응안과 의견 중 하나만 있으면 된다. 문제가 없으면 빈 문자열을 돌려준다.
 */
export function validateDecision(role: ClientRole, { optionId, text }: DecisionValues) {
  const hasOption = optionId !== ''
  const hasText = text.trim() !== ''

  if (role === 'member') {
    return hasOption || hasText ? '' : DECISION_ERROR_MESSAGE.OPTION_OR_OPINION_REQUIRED
  }
  if (!hasOption) {
    return DECISION_ERROR_MESSAGE.OPTION_REQUIRED
  }
  if (!hasText) {
    return DECISION_ERROR_MESSAGE.REASON_REQUIRED
  }
  return ''
}
