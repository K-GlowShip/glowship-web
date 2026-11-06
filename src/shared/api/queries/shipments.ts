import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getShipments, type GetShipmentsParams } from '../endpoints/shipments'
import { SYNC_DATA_STALE_TIME_MS } from './stale-time'

export const shipmentQueries = {
  list: (params: GetShipmentsParams) =>
    queryOptions({
      queryKey: ['shipments', 'list', params],
      queryFn: ({ signal }) => getShipments(params, { signal }),
      staleTime: SYNC_DATA_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
