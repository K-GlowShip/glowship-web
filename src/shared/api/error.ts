import { isAxiosError } from 'axios'

// 서버의 공통 에러 응답 형식 (glowship-server `ErrorResponse`)
interface ErrorResponse {
  code: string
  message: string
  request_id: string
}

/** 서버 응답 없이 클라이언트에서 만드는 에러. 코드와 사용자 메시지를 한 곳에서 관리한다. */
export const CLIENT_ERROR = {
  NETWORK_ERROR: { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해주세요.' },
  TIMEOUT: { code: 'TIMEOUT', message: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.' },
  UNKNOWN_ERROR: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
} as const

interface ApiErrorInit {
  status: number | null
  code: string
  message: string
  requestId?: string
}

export class ApiError extends Error {
  /** HTTP 상태 코드. 서버 응답을 받지 못한 경우(네트워크 오류, 타임아웃)는 null */
  readonly status: number | null
  /** 서버가 내려준 에러 코드(예: EMAIL_DUPLICATED). 클라이언트 오류는 CLIENT_ERROR의 code */
  readonly code: string
  /** 서버 로그 추적용 요청 ID. 서버 응답이 없으면 null */
  readonly requestId: string | null

  constructor(init: ApiErrorInit) {
    super(init.message)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.requestId = init.requestId ?? null
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

const isErrorResponse = (data: unknown): data is ErrorResponse =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as ErrorResponse).code === 'string' &&
  typeof (data as ErrorResponse).message === 'string'

/** axios 에러를 ApiError로 변환한다. 이미 ApiError면 그대로 반환한다. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error

  if (isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response
      if (isErrorResponse(data)) {
        return new ApiError({
          status,
          code: data.code,
          message: data.message,
          requestId: data.request_id,
        })
      }
      // 서버의 공통 형식이 아닌 응답(프록시 오류 등)
      return new ApiError({
        status,
        ...CLIENT_ERROR.UNKNOWN_ERROR,
      })
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({
        status: null,
        ...CLIENT_ERROR.TIMEOUT,
      })
    }

    return new ApiError({
      status: null,
      ...CLIENT_ERROR.NETWORK_ERROR,
    })
  }

  return new ApiError({
    status: null,
    ...CLIENT_ERROR.UNKNOWN_ERROR,
  })
}
