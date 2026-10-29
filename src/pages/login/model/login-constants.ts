export const EMAIL_PATTERN = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
export const EMAIL_MAX_LENGTH = 50

export const LOGIN_ERROR_MESSAGE = {
  EMAIL_REQUIRED: '이메일을 입력해주세요.',
  EMAIL_TOO_LONG: `이메일은 ${EMAIL_MAX_LENGTH}자 이하로 입력해주세요.`,
  EMAIL_INVALID: '이메일 형식이 올바르지 않습니다.',
  PASSWORD_REQUIRED: '비밀번호를 입력해주세요.',
} as const
