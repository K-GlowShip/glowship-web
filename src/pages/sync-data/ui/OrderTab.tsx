import { useQuery } from '@tanstack/react-query'

import { orderQueries } from '@/shared/api'

import { useListParams } from '../model/use-list-params'
import { DataTabLayout } from './DataTabLayout'
import { OrderTable } from './OrderTable'

export function OrderTab() {
  const list = useListParams()
  const query = useQuery(orderQueries.list(list.params))

  return (
    <DataTabLayout
      searchId="order-search"
      searchLabel="주문 검색"
      searchPlaceholder="주문 번호, 상품 코드 또는 상품명"
      input={list.input}
      onInputChange={list.onInputChange}
      onSubmit={() => list.onSubmit(query.refetch)}
      query={query}
      page={list.page}
      onPageChange={list.onPageChange}
    >
      <OrderTable query={query} />
    </DataTabLayout>
  )
}
