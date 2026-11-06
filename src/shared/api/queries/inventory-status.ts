import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getInventoryStatus } from '../endpoints/inventory-status'
import type { PageParams } from '../page'
import { LIST_STALE_TIME_MS } from './stale-time'

export const inventoryStatusQueries = {
  list: (params: PageParams) =>
    queryOptions({
      queryKey: ['inventory-status', 'list', params],
      queryFn: ({ signal }) => getInventoryStatus(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
}
