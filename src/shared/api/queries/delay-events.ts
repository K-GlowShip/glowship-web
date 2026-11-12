import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getDelayEvent, getDelayEvents, type GetDelayEventsParams } from '../endpoints/delay-events'
import { LIST_STALE_TIME_MS } from './stale-time'

export const delayEventQueries = {
  /** 이 도메인의 모든 쿼리. 한꺼번에 무효화할 때 쓴다 */
  all: ['delay-events'] as const,
  list: (params: GetDelayEventsParams) =>
    queryOptions({
      queryKey: ['delay-events', 'list', params],
      queryFn: ({ signal }) => getDelayEvents(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
  detail: (delayEventId: string) =>
    queryOptions({
      queryKey: ['delay-events', 'detail', delayEventId],
      queryFn: ({ signal }) => getDelayEvent(delayEventId, { signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
