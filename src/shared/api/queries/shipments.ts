import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getShipments, type GetShipmentsParams } from '../endpoints/shipments'
import { LIST_STALE_TIME_MS } from './stale-time'

export const shipmentQueries = {
  list: (params: GetShipmentsParams) =>
    queryOptions({
      queryKey: ['shipments', 'list', params],
      queryFn: ({ signal }) => getShipments(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
