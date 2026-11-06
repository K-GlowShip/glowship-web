import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import {
  type ApiError,
  isApiError,
  isMeQuery,
  isUnauthorizedError,
  meQueryOptions,
} from '@/shared/api'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}

const MAX_QUERY_RETRY = 2

// 로그인한 상태에서 다른 API가 401을 받으면 세션이 끝났을 수 있다. 내 계정을 다시 확인한다.
// - 로그인 전의 401(예: 비밀번호 불일치)은 세션 만료가 아니므로 `/me` 데이터가 있을 때만 처리한다.
// - 여러 API가 동시에 401을 받아도 `/me` 요청은 하나만 보내도록, 진행 중인 요청을 취소하지 않는다.
const checkSession = () => {
  const isLoggedIn = queryClient.getQueryData(meQueryOptions.queryKey) !== undefined
  if (isLoggedIn) {
    void queryClient.invalidateQueries(
      { queryKey: meQueryOptions.queryKey },
      { cancelRefetch: false },
    )
  }
}

// `/me`가 401이면 세션이 끝난 것이 확정이다. 다음에 로그인할 사용자에게 이전 사용자의 데이터가 보이지 않게 비운다.
const clearUserData = () => {
  queryClient.removeQueries({ predicate: (query) => !isMeQuery(query) })
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!isUnauthorizedError(error)) {
        return
      }
      if (isMeQuery(query)) {
        clearUserData()
      } else {
        checkSession()
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        checkSession()
      }
    },
  }),
  defaultOptions: {
    queries: {
      // 4xx는 다시 요청해도 결과가 같으므로 재시도하지 않는다. 네트워크 오류와 5xx만 재시도한다.
      retry: (failureCount, error) => {
        const isClientError = isApiError(error) && error.status !== null && error.status < 500
        return !isClientError && failureCount < MAX_QUERY_RETRY
      },
    },
    mutations: {
      // 쓰기 요청은 타임아웃 등으로 실패해도 서버에 반영됐을 수 있어, 자동 재시도하면 중복 처리될 수 있다.
      retry: 0,
    },
  },
})
