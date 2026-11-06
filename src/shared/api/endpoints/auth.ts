import { API } from '../fetcher'
import { ENDPOINT } from '../paths'

export interface LoginRequest {
  email: string
  /** Base64로 인코딩한 비밀번호 */
  password: string
}

/** 로그인한다. 응답 본문은 없고, 토큰은 서버가 HttpOnly 쿠키로 내려준다. */
export const login = (body: LoginRequest) => API.post<void, LoginRequest>(ENDPOINT.AUTH.LOGIN, body)

/** 로그아웃한다. 응답은 204이고, 서버가 쿠키를 만료시킨다. 쿠키가 없어도 같은 응답이다. */
export const logout = () => API.post<void>(ENDPOINT.AUTH.LOGOUT)
