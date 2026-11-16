import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { type GetDecisionsParams, getDecisions } from '../endpoints/decisions'
import { LIST_STALE_TIME_MS } from './stale-time'

export const decisionQueries = {
  /** 이 도메인의 모든 쿼리. 한꺼번에 무효화할 때 쓴다 */
  all: ['decisions'] as const,
  list: (params: GetDecisionsParams) =>
    queryOptions({
      queryKey: ['decisions', 'list', params],
      queryFn: ({ signal }) => getDecisions(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
