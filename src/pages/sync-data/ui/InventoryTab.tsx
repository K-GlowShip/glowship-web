import { useQuery } from '@tanstack/react-query'

import { inventoryQueries } from '@/shared/api'

import { useListParams } from '../model/use-list-params'
import { DataTabLayout } from './DataTabLayout'
import { InventoryTable } from './InventoryTable'

export function InventoryTab() {
  const list = useListParams()
  const query = useQuery(inventoryQueries.list(list.params))

  return (
    <DataTabLayout
      searchId="inventory-search"
      searchLabel="재고 검색"
      searchPlaceholder="SKU 코드 또는 상품명"
      input={list.input}
      onInputChange={list.onInputChange}
      onSubmit={() => list.onSubmit(query.refetch)}
      query={query}
      page={list.page}
      onPageChange={list.onPageChange}
      Title={query.data?.inventoryDate ? `기준일 ${query.data.inventoryDate}` : undefined}
    >
      <InventoryTable query={query} />
    </DataTabLayout>
  )
}
