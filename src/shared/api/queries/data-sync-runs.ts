import { queryOptions } from '@tanstack/react-query'

import { getLatestDataSyncRuns } from '../endpoints/data-sync-runs'
import { LIST_STALE_TIME_MS } from './stale-time'

export const dataSyncRunQueries = {
  latest: () =>
    queryOptions({
      queryKey: ['data-sync-runs', 'latest'],
      queryFn: ({ signal }) => getLatestDataSyncRuns({ signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
