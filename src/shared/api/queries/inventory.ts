import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getInventory, type GetInventoryParams } from '../endpoints/inventory'
import { LIST_STALE_TIME_MS } from './stale-time'

export const inventoryQueries = {
  list: (params: GetInventoryParams) =>
    queryOptions({
      queryKey: ['inventory', 'list', params],
      queryFn: ({ signal }) => getInventory(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
