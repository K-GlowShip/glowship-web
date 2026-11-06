import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { type GetDecisionsParams, getDecisions } from '../endpoints/decisions'
import { LIST_STALE_TIME_MS } from './stale-time'

export const decisionQueries = {
  list: (params: GetDecisionsParams) =>
    queryOptions({
      queryKey: ['decisions', 'list', params],
      queryFn: ({ signal }) => getDecisions(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
