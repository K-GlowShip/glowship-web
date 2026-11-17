import { queryOptions } from '@tanstack/react-query'

import { getClientUsers, type GetClientUsersParams } from '../endpoints/admin-users'
import { LIST_STALE_TIME_MS } from './stale-time'

const ADMIN_USERS_KEY = 'admin-users'

export const adminUserQueries = {
  /** 계정을 만들거나 고친 뒤 목록을 다시 받을 때 쓰는 키 */
  listKey: () => [ADMIN_USERS_KEY, 'list'] as const,
  // 같은 고객사에서 필터·페이지만 바꿀 때는 이전 목록을 유지해 표가 깜빡이지 않게 한다.
  // 고객사가 바뀌면 이전 고객사의 계정이 새 고객사 제목 아래에 잠깐 보이지 않도록 유지하지 않는다
  list: (params: GetClientUsersParams) =>
    queryOptions({
      queryKey: [ADMIN_USERS_KEY, 'list', params],
      queryFn: ({ signal }) => getClientUsers(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: (previousData, previousQuery) => {
        const previousParams = previousQuery?.queryKey[2] as GetClientUsersParams | undefined
        return previousParams?.companyId === params.companyId ? previousData : undefined
      },
    }),
}
