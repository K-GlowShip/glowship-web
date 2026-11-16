import { queryOptions } from '@tanstack/react-query'

import { getAnalysisRun } from '../endpoints/analysis-runs'
import { LIST_STALE_TIME_MS } from './stale-time'

export const analysisRunQueries = {
  /** 이 도메인의 모든 쿼리. 한꺼번에 무효화할 때 쓴다 */
  all: ['analysis-runs'] as const,
  detail: (runId: string) =>
    queryOptions({
      queryKey: ['analysis-runs', 'detail', runId],
      queryFn: ({ signal }) => getAnalysisRun(runId, { signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
