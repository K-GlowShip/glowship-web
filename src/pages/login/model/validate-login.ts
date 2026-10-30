import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, LOGIN_ERROR_MESSAGE } from './login-constants'

export interface LoginFormValues {
  email: string
  password: string
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

export function validateLogin({ email, password }: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = LOGIN_ERROR_MESSAGE.EMAIL_REQUIRED
  } else if (trimmedEmail.length > EMAIL_MAX_LENGTH) {
    errors.email = LOGIN_ERROR_MESSAGE.EMAIL_TOO_LONG
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = LOGIN_ERROR_MESSAGE.EMAIL_INVALID
  }

  if (!password) {
    errors.password = LOGIN_ERROR_MESSAGE.PASSWORD_REQUIRED
  }

  return errors
}
