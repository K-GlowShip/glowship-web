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
          {/* 모바일에서는 아래로 스크롤해도 탭이 위에 붙어 있게 한다. 스크롤 영역의 안쪽 여백 16px만큼 올려 맨 위에 맞닿게 하고, 웹은 고정하지 않는다. 밑줄 막대가 이 목록 기준(absolute)으로 놓이므로 static이 아니라 relative로 되돌린다 */}
          <TabsList className="sticky -top-16pxr z-10 bg-card web:relative web:top-0">
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
