import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getDelayEvents, type GetDelayEventsParams } from '../endpoints/delay-events'
import { LIST_STALE_TIME_MS } from './stale-time'

export const delayEventQueries = {
  list: (params: GetDelayEventsParams) =>
    queryOptions({
      queryKey: ['delay-events', 'list', params],
      queryFn: ({ signal }) => getDelayEvents(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
