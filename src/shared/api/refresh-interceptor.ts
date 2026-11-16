import { type AxiosInstance, isAxiosError } from 'axios'

import { ENDPOINT } from './paths'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** true면 401을 받아도 접근 토큰 재발급을 시도하지 않는다. 재발급 요청 자체에 쓴다 */
    skipTokenRefresh?: boolean
    /** 재발급 뒤에 다시 보낸 요청이다. 같은 요청을 두 번 이상 다시 보내지 않게 표시한다 */
    isTokenRefreshRetry?: boolean
  }
}

const HTTP_UNAUTHORIZED = 401

/** 로그인 전 요청이나 재발급 자체는 401이어도 접근 토큰 문제가 아니므로 재발급 대상이 아니다 */
const NO_REFRESH_PATHS: readonly string[] = [
  ENDPOINT.AUTH.SIGNUP,
  ENDPOINT.AUTH.LOGIN,
  ENDPOINT.AUTH.LOGOUT,
  ENDPOINT.AUTH.REFRESH,
]

const isNoRefreshPath = (url: string | undefined) =>
  url !== undefined && NO_REFRESH_PATHS.some((path) => url.endsWith(path))

/**
 * 접근 토큰이 만료돼 보호된 API가 401을 주면, 재발급(`POST /auth/refresh`)을 한 번 하고 원래 요청을 다시 보낸다(명세 4.1).
 * - 여러 요청이 동시에 401을 받아도 재발급은 하나만 보내고 모두 그 결과를 기다린다.
 * - 재발급이 실패하면(refresh 토큰 만료·위조, 비활성 계정 등) 원래의 401을 그대로 던져서, 기존처럼 세션이 끝난 것으로 처리한다.
 * - 다시 보낸 요청이 또 401이면 더 반복하지 않는다. 401은 요청이 처리되기 전의 인증 실패라서 쓰기 요청도 다시 보내도 중복되지 않는다.
 * 응답을 `ApiError`로 바꾸기 전의 원본 오류에서 요청 설정을 읽어야 하므로, 오류 변환 인터셉터보다 먼저 등록해야 한다.
 */
export const installRefreshInterceptor = (instance: AxiosInstance) => {
  let pendingRefresh: Promise<void> | null = null

  const refreshSession = () => {
    pendingRefresh ??= instance
      .post(ENDPOINT.AUTH.REFRESH, undefined, { skipTokenRefresh: true })
      .then(() => undefined)
      .finally(() => {
        pendingRefresh = null
      })
    return pendingRefresh
  }

  instance.interceptors.response.use(undefined, async (error: unknown) => {
    if (
      !isAxiosError(error) ||
      error.response?.status !== HTTP_UNAUTHORIZED ||
      !error.config ||
      error.config.skipTokenRefresh ||
      error.config.isTokenRefreshRetry ||
      isNoRefreshPath(error.config.url)
    ) {
      return Promise.reject(error)
    }

    try {
      await refreshSession()
    } catch {
      // 재발급이 안 되면 원래 요청의 401로 끝낸다
      return Promise.reject(error)
    }
    return instance.request({ ...error.config, isTokenRefreshRetry: true })
  })
}
