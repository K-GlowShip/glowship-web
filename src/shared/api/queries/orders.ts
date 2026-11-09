import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getOrders, type GetOrdersParams } from '../endpoints/orders'
import { LIST_STALE_TIME_MS } from './stale-time'

export const orderQueries = {
  list: (params: GetOrdersParams) =>
    queryOptions({
      queryKey: ['orders', 'list', params],
      queryFn: ({ signal }) => getOrders(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
