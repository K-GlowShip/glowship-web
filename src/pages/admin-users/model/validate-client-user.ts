import { CLIENT_ROLE_CODE, type ClientRoleCode } from '@/shared/api'

import {
  CLIENT_USER_ERROR,
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  PASSWORD_PATTERN,
} from './client-user-text'

export interface ClientUserFormValues {
  email: string
  password: string
  roleCode: ClientRoleCode
  displayName: string
}

export type ClientUserFormErrors = Partial<Record<keyof ClientUserFormValues, string>>

export const EMPTY_CLIENT_USER_FORM: ClientUserFormValues = {
  email: '',
  password: '',
  // 팀장 계정을 가장 많이 만들어서 처음부터 골라 둔다
  roleCode: CLIENT_ROLE_CODE.CLIENT_LEAD,
  displayName: '',
}

/** 이메일·이름은 앞뒤 공백을 뺀 값으로 보고 서버에도 그 값을 보낸다. 비밀번호는 그대로 둔다 */
export const normalizeClientUserValues = (values: ClientUserFormValues): ClientUserFormValues => ({
  ...values,
  email: values.email.trim(),
  displayName: values.displayName.trim(),
})

/** `[어긋났는가, 보여 줄 문구]`. 앞에 있는 규칙부터 보고, 처음 어긋난 문구 하나만 쓴다 */
type Rule = readonly [failed: boolean, message: string]

/** 서버가 거절하기 전에 알 수 있는 입력 오류를 찾는다. 이름은 반드시 있어야 한다 */
export function validateClientUser(values: ClientUserFormValues): ClientUserFormErrors {
  const { email, password, displayName } = normalizeClientUserValues(values)
  const errors: ClientUserFormErrors = {}

  const check = (field: keyof ClientUserFormErrors, rules: Rule[]) => {
    const message = rules.find(([failed]) => failed)?.[1]
    if (message) {
      errors[field] = message
    }
  }

  check('email', [
    [!email, CLIENT_USER_ERROR.EMAIL_REQUIRED],
    [email.length > EMAIL_MAX_LENGTH, CLIENT_USER_ERROR.EMAIL_TOO_LONG],
    [!EMAIL_PATTERN.test(email), CLIENT_USER_ERROR.EMAIL_INVALID],
  ])
  check('password', [
    [!password, CLIENT_USER_ERROR.PASSWORD_REQUIRED],
    [!PASSWORD_PATTERN.test(password), CLIENT_USER_ERROR.PASSWORD_INVALID],
  ])
  check('displayName', [
    [!displayName, CLIENT_USER_ERROR.DISPLAY_NAME_REQUIRED],
    [displayName.length > DISPLAY_NAME_MAX_LENGTH, CLIENT_USER_ERROR.DISPLAY_NAME_TOO_LONG],
  ])

  return errors
}
