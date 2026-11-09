import { queryOptions } from '@tanstack/react-query'

import { getAnalysisRun } from '../endpoints/analysis-runs'
import { LIST_STALE_TIME_MS } from './stale-time'

export const analysisRunQueries = {
  detail: (runId: string) =>
    queryOptions({
      queryKey: ['analysis-runs', 'detail', runId],
      queryFn: ({ signal }) => getAnalysisRun(runId, { signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
