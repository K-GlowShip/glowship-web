import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getClientUsers, type GetClientUsersParams } from '../endpoints/admin-users'
import { LIST_STALE_TIME_MS } from './stale-time'

const ADMIN_USERS_KEY = 'admin-users'

export const adminUserQueries = {
  /** 계정을 만들거나 고친 뒤 목록을 다시 받을 때 쓰는 키 */
  listKey: () => [ADMIN_USERS_KEY, 'list'] as const,
  // 고객사나 필터·페이지를 바꿀 때 이전 목록을 유지해 표가 깜빡이지 않게 한다
  list: (params: GetClientUsersParams) =>
    queryOptions({
      queryKey: [ADMIN_USERS_KEY, 'list', params],
      queryFn: ({ signal }) => getClientUsers(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
