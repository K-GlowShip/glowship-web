import type { LoginFormValues } from './validate-login'

/**
 * 서버 없이 쓰는 데모 계정. `VITE_DEMO_LOGIN=true`인 배포에서만 동작한다.
 * 입력하기 쉽도록 이메일 형식이 아닌 `admin`을 쓰며, 이메일 형식 검증도 이 계정만 건너뛴다.
 */
export const DEMO_ACCOUNT: LoginFormValues = {
  email: 'admin',
  password: 'password',
}

export const isDemoEmail = (email: string) => email.trim().toLowerCase() === DEMO_ACCOUNT.email

export const isDemoAccount = ({ email, password }: LoginFormValues) =>
  isDemoEmail(email) && password === DEMO_ACCOUNT.password
