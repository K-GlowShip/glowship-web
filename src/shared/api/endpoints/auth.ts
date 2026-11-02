import { API } from '../fetcher'
import { ENDPOINT } from '../paths'

export interface LoginRequest {
  email: string
  /** Base64로 인코딩한 비밀번호 */
  password: string
}

/** 로그인한다. 응답 본문은 없고, 토큰은 서버가 HttpOnly 쿠키로 내려준다. */
export const login = (body: LoginRequest) => API.post<void, LoginRequest>(ENDPOINT.AUTH.LOGIN, body)
