import { queryOptions } from '@tanstack/react-query'

import { getMe } from '../endpoints/me'

export const meQueryOptions = queryOptions({
  queryKey: ['me'],
  queryFn: ({ signal }) => getMe({ signal }),
  // 내 계정은 자주 바뀌지 않는다. 화면 이동·창 포커스마다 다시 받지 않고, 세션 만료는 다른 API의 401로 알아챈다.
  staleTime: Infinity,
})

/** query가 내 계정 조회인지 확인한다. 로그인·세션 만료 때 다른 사용자 데이터만 비울 때 쓴다. */
export const isMeQuery = ({ queryKey }: { queryKey: readonly unknown[] }) =>
  queryKey[0] === meQueryOptions.queryKey[0]
