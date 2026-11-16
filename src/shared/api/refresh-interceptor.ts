import { type AxiosInstance, isAxiosError } from 'axios'

import { ENDPOINT } from './paths'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** true면 401을 받아도 접근 토큰 재발급을 시도하지 않는다. 재발급 요청 자체에 쓴다 */
    skipTokenRefresh?: boolean
    /** 재발급 뒤에 다시 보낸 요청이다. 같은 요청을 두 번 이상 다시 보내지 않게 표시한다 */
    isTokenRefreshRetry?: boolean
    /** 요청을 보낸 시각(ms). 재발급이 끝나기 전에 보낸 요청의 뒤늦은 401인지 가리는 데 쓴다 */
    requestSentAt?: number
  }
}

const HTTP_UNAUTHORIZED = 401
const HTTP_FORBIDDEN = 403

/** 로그인 전 요청이나 재발급 자체는 401이어도 접근 토큰 문제가 아니므로 재발급 대상이 아니다 */
const NO_REFRESH_PATHS: readonly string[] = [
  ENDPOINT.AUTH.SIGNUP,
  ENDPOINT.AUTH.LOGIN,
  ENDPOINT.AUTH.LOGOUT,
  ENDPOINT.AUTH.REFRESH,
]

const isNoRefreshPath = (url: string | undefined) =>
  url !== undefined && NO_REFRESH_PATHS.some((path) => url.endsWith(path))

/** refresh 토큰이 없거나 만료·위조됐거나(401) 계정이 비활성(403)이라 서버가 재발급을 거절했는지. 네트워크 오류나 5xx는 일시적이라 거절이 아니다 */
const isRefreshRejection = (error: unknown) =>
  isAxiosError(error) &&
  (error.response?.status === HTTP_UNAUTHORIZED || error.response?.status === HTTP_FORBIDDEN)

/**
 * 접근 토큰이 만료돼 보호된 API가 401을 주면, 재발급(`POST /auth/refresh`)을 한 번 하고 원래 요청을 다시 보낸다(명세 4.1).
 * 요청을 최소로 보내려고 아래처럼 아낀다.
 * - 여러 요청이 동시에 401을 받아도 재발급은 하나만 보내고 모두 그 결과를 기다린다.
 * - 재발급이 끝나기 전에 보낸 요청의 뒤늦은 401은 이미 새 토큰이 있으니, 재발급 없이 바로 다시 보낸다.
 * - 서버가 재발급을 거절하면(401·403) 다음 로그인에 성공할 때까지 다시 시도하지 않는다. 같은 거절을 되풀이해 받지 않고,
 *   비활성 계정에 재발급을 반복하지 말라는 명세도 지킨다. 네트워크 오류 같은 일시적 실패는 다음 401에서 다시 시도한다.
 * - 재발급이 실패하면 원래의 401을 그대로 던져서, 기존처럼 세션이 끝난 것으로 처리한다.
 * - 다시 보낸 요청이 또 401이면 더 반복하지 않는다. 401은 요청이 처리되기 전의 인증 실패라서 쓰기 요청도 다시 보내도 중복되지 않는다.
 * 응답을 `ApiError`로 바꾸기 전의 원본 오류에서 요청 설정을 읽어야 하므로, 오류 변환 인터셉터보다 먼저 등록해야 한다.
 */
export const installRefreshInterceptor = (instance: AxiosInstance) => {
  let pendingRefresh: Promise<void> | null = null
  let lastRefreshedAt = 0
  let isRefreshRejected = false

  const refreshSession = () => {
    pendingRefresh ??= instance
      .post(ENDPOINT.AUTH.REFRESH, undefined, { skipTokenRefresh: true })
      .then(() => {
        lastRefreshedAt = Date.now()
      })
      .catch((error: unknown) => {
        isRefreshRejected = isRefreshRejection(error)
        throw error
      })
      .finally(() => {
        pendingRefresh = null
      })
    return pendingRefresh
  }

  instance.interceptors.request.use((config) => {
    config.requestSentAt = Date.now()
    return config
  })

  instance.interceptors.response.use(
    (response) => {
      // 다시 로그인했으니 재발급을 다시 시도할 수 있다
      if (response.config.url?.endsWith(ENDPOINT.AUTH.LOGIN)) {
        isRefreshRejected = false
      }
      return response
    },
    async (error: unknown) => {
      if (
        !isAxiosError(error) ||
        error.response?.status !== HTTP_UNAUTHORIZED ||
        !error.config ||
        error.config.skipTokenRefresh ||
        error.config.isTokenRefreshRetry ||
        isNoRefreshPath(error.config.url) ||
        isRefreshRejected
      ) {
        return Promise.reject(error)
      }

      // 재발급이 끝나기 전에 보낸 요청이면 이미 새 토큰이 있다
      const hasFreshToken = (error.config.requestSentAt ?? Infinity) < lastRefreshedAt
      if (!hasFreshToken) {
        try {
          await refreshSession()
        } catch {
          // 재발급이 안 되면 원래 요청의 401로 끝낸다
          return Promise.reject(error)
        }
      }
      return instance.request({ ...error.config, isTokenRefreshRetry: true })
    },
  )
}
