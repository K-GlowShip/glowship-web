import axios, { type AxiosRequestConfig } from 'axios'

import { env } from '@/shared/config'

import { toApiError } from './error'
import { installRefreshInterceptor } from './refresh-interceptor'
import { getVersionUrl } from './version'

const API_PREFIX = '/api'
const REQUEST_TIMEOUT_MS = 10_000

export const fetcher = axios.create({
  baseURL: `${env.apiBaseUrl}${API_PREFIX}`,
  timeout: REQUEST_TIMEOUT_MS,
  // 서버가 쿠키로 인증하므로 요청마다 쿠키를 보낸다 (서버 CORS의 allow_credentials와 짝)
  withCredentials: true,
})

// 버전이 없는 요청 경로에는 기본 버전을 붙인다. 다른 버전은 경로에 직접 적는다. (예: '/v2/admins')
fetcher.interceptors.request.use((config) => {
  if (config.url) {
    config.url = getVersionUrl(config.url)
  }
  return config
})

// 접근 토큰이 만료돼 401을 받으면 재발급 뒤 원래 요청을 다시 보낸다. 오류를 ApiError로 바꾸기 전에 원본 오류가 필요해서 아래 변환보다 먼저 등록한다.
// 데모 로그인이 켜져 있어도 데모 계정이 아닌 로그인은 서버 세션이므로 항상 등록한다. 데모 세션은 요청이 가지 않아 영향이 없다.
installRefreshInterceptor(fetcher)

// 모든 실패 응답을 ApiError로 통일한다
fetcher.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)

/** 응답 본문(data)만 돌려주는 요청 메서드 모음 */
export const API = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    fetcher.get<T>(url, config).then((response) => response.data),
  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    fetcher.post<T>(url, data, config).then((response) => response.data),
  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    fetcher.put<T>(url, data, config).then((response) => response.data),
  patch: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    fetcher.patch<T>(url, data, config).then((response) => response.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    fetcher.delete<T>(url, config).then((response) => response.data),
}
