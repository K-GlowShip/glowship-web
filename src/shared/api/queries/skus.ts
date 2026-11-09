import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getSku, getSkus, type GetSkusParams } from '../endpoints/skus'
import { LIST_STALE_TIME_MS } from './stale-time'

export const skuQueries = {
  // 페이지나 검색어를 바꿀 때 이전 목록을 유지해 표가 깜빡이지 않게 한다
  list: (params: GetSkusParams) =>
    queryOptions({
      queryKey: ['skus', 'list', params],
      queryFn: ({ signal }) => getSkus(params, { signal }),
      staleTime: LIST_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    }),
  detail: (skuId: string) =>
    queryOptions({
      queryKey: ['skus', 'detail', skuId],
      queryFn: ({ signal }) => getSku(skuId, { signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
