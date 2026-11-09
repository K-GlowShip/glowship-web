import { useQuery } from '@tanstack/react-query'

import { shipmentQueries } from '@/shared/api'

import { useListParams } from '../model/use-list-params'
import { DataTabLayout } from './DataTabLayout'
import { ShipmentTable } from './ShipmentTable'

export function ShipmentTab() {
  const list = useListParams()
  const query = useQuery(shipmentQueries.list(list.params))

  return (
    <DataTabLayout
      searchId="shipment-search"
      searchLabel="선적 검색"
      searchPlaceholder="선적 코드"
      input={list.input}
      onInputChange={list.onInputChange}
      onSubmit={() => list.onSubmit(query.refetch)}
      query={query}
      page={list.page}
      onPageChange={list.onPageChange}
    >
      <ShipmentTable query={query} />
    </DataTabLayout>
  )
}
