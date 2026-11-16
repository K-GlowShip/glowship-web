import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getShipments, type GetShipmentsParams } from '../endpoints/shipments'
import { fetchAllPages, MAX_PAGE_SIZE } from '../fetch-all-pages'
import { LIST_STALE_TIME_MS } from './stale-time'

export const shipmentQueries = {
  list: (params: GetShipmentsParams) =>
    queryOptions({
      queryKey: ['shipments', 'list', params],
      queryFn: ({ signal }) => getShipments(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
  /** 모든 선적(입고 완료 포함). 건수를 세는 화면용이다. 많으면 앞쪽만 받는다 */
  listAll: () =>
    queryOptions({
      queryKey: ['shipments', 'all'],
      queryFn: ({ signal }) =>
        fetchAllPages((page) => getShipments({ page, size: MAX_PAGE_SIZE }, { signal })),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
