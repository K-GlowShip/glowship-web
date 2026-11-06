import { queryOptions } from '@tanstack/react-query'

import { getLatestDataSyncRuns } from '../endpoints/data-sync-runs'
import { SYNC_DATA_STALE_TIME_MS } from './stale-time'

export const dataSyncRunQueries = {
  latest: () =>
    queryOptions({
      queryKey: ['data-sync-runs', 'latest'],
      queryFn: ({ signal }) => getLatestDataSyncRuns({ signal }),
      staleTime: SYNC_DATA_STALE_TIME_MS,
    }),
}
