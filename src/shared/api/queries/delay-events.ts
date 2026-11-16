import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getDelayEvent, getDelayEvents, type GetDelayEventsParams } from '../endpoints/delay-events'
import { fetchAllPages, MAX_PAGE_SIZE } from '../fetch-all-pages'
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
  /** 모든 지연 이벤트. 건수를 세는 화면용이다. 많으면 앞쪽만 받는다 */
  listAll: (params: Omit<GetDelayEventsParams, 'page' | 'size'> = {}) =>
    queryOptions({
      queryKey: ['delay-events', 'all', params],
      queryFn: ({ signal }) =>
        fetchAllPages((page) =>
          getDelayEvents({ ...params, page, size: MAX_PAGE_SIZE }, { signal }),
        ),
      staleTime: LIST_STALE_TIME_MS,
    }),
  detail: (delayEventId: string) =>
    queryOptions({
      queryKey: ['delay-events', 'detail', delayEventId],
      queryFn: ({ signal }) => getDelayEvent(delayEventId, { signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
