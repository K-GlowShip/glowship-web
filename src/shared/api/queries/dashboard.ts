import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import {
  getDashboardSummary,
  getInboundTrend,
  type GetInboundTrendParams,
} from '../endpoints/dashboard'
import { LIST_STALE_TIME_MS } from './stale-time'

export const dashboardQueries = {
  summary: () =>
    queryOptions({
      queryKey: ['dashboard', 'summary'],
      queryFn: ({ signal }) => getDashboardSummary({ signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
  inboundTrend: (params: GetInboundTrendParams) =>
    queryOptions({
      queryKey: ['dashboard', 'inbound-trend', params],
      queryFn: ({ signal }) => getInboundTrend(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      // 기간을 바꿀 때 이전 그래프를 유지해 깜빡이지 않게 한다
      placeholderData: keepPreviousData,
    }),
}
