import { useQuery } from '@tanstack/react-query'

import { type Shipment, shipmentQueries } from '@/shared/api'
import { useDetailDialog } from '@/shared/lib/use-detail-dialog'

import { useListParams } from '../model/use-list-params'
import { DataTabLayout } from './DataTabLayout'
import { ShipmentDetailDrawer } from './ShipmentDetailDrawer'
import { ShipmentTable } from './ShipmentTable'

export function ShipmentTab() {
  const list = useListParams()
  const detailDialog = useDetailDialog<Shipment>()
  const query = useQuery(shipmentQueries.list(list.params))

  return (
    <>
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
        <ShipmentTable query={query} onSelect={detailDialog.show} />
      </DataTabLayout>

      <ShipmentDetailDrawer
        shipment={detailDialog.selected}
        open={detailDialog.open}
        onOpenChange={detailDialog.onOpenChange}
        onCloseAutoFocus={detailDialog.onCloseAutoFocus}
      />
    </>
  )
}
