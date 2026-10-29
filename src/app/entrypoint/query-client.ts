import { QueryClient } from '@tanstack/react-query'

import { type ApiError, isApiError } from '@/shared/api'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}

const MAX_QUERY_RETRY = 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 4xx는 다시 요청해도 결과가 같으므로 재시도하지 않는다. 네트워크 오류와 5xx만 재시도한다.
      retry: (failureCount, error) => {
        const isClientError = isApiError(error) && error.status !== null && error.status < 500
        return !isClientError && failureCount < MAX_QUERY_RETRY
      },
    },
  },
})
