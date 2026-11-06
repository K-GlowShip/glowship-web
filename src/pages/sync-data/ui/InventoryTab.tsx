import { useQuery } from '@tanstack/react-query'

import { inventoryQueries } from '@/shared/api'

import { useListParams } from '../model/use-list-params'
import { DataTabLayout } from './DataTabLayout'
import { InventoryTable } from './InventoryTable'

export function InventoryTab() {
  const list = useListParams()
  const { data, error, isFetching, refetch } = useQuery(inventoryQueries.list(list.params))

  return (
    <DataTabLayout
      searchId="inventory-search"
      searchLabel="재고 검색"
      searchPlaceholder="SKU 코드 또는 상품명"
      input={list.input}
      onInputChange={list.onInputChange}
      onSubmit={() => list.onSubmit(refetch)}
      data={data}
      error={error}
      isFetching={isFetching}
      onRetry={() => void refetch()}
      page={list.page}
      onPageChange={list.onPageChange}
      Title={data?.inventoryDate ? `기준일 ${data.inventoryDate}` : undefined}
    >
      <InventoryTable items={data?.items ?? []} />
    </DataTabLayout>
  )
}
