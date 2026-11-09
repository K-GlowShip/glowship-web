import { Card, CardContent } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { InventoryTab } from './InventoryTab'
import { OrderTab } from './OrderTab'
import { ProductTab } from './ProductTab'
import { ShipmentTab } from './ShipmentTab'

const TAB = {
  ORDER: 'order',
  INVENTORY: 'inventory',
  SHIPMENT: 'shipment',
  PRODUCT: 'product',
} as const

/** 연동 데이터 탭. 선택한 탭만 그려서 그 탭의 데이터만 요청한다. */
export function SyncDataTabs() {
  return (
    <Card className="rounded-panel">
      <CardContent className="p-32pxr">
        <Tabs defaultValue={TAB.ORDER}>
          <TabsList>
            <TabsTrigger value={TAB.ORDER}>주문</TabsTrigger>
            <TabsTrigger value={TAB.INVENTORY}>재고</TabsTrigger>
            <TabsTrigger value={TAB.SHIPMENT}>선적</TabsTrigger>
            <TabsTrigger value={TAB.PRODUCT}>상품</TabsTrigger>
          </TabsList>

          <TabsContent value={TAB.ORDER}>
            <OrderTab />
          </TabsContent>
          <TabsContent value={TAB.INVENTORY}>
            <InventoryTab />
          </TabsContent>
          <TabsContent value={TAB.SHIPMENT}>
            <ShipmentTab />
          </TabsContent>
          <TabsContent value={TAB.PRODUCT}>
            <ProductTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
