import { getRegionLabel } from '@/entities/delay-event'
import type { InventoryItem } from '@/shared/api'
import { formatNumber } from '@/shared/lib/format-number'
import {
  Table,
  TableBody,
  TableCell,
  type ListQuery,
  TableQueryRows,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

export function InventoryTable({ query }: { query: ListQuery<InventoryItem> }) {
  return (
    <Table className="min-w-1010pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="w-130pxr">창고</TableHead>
          <TableHead className="w-110pxr">권역</TableHead>
          <TableHead className="w-140pxr">SKU 코드</TableHead>
          <TableHead className="min-w-260pxr">상품명</TableHead>
          <TableHead className="w-100pxr text-right">보유</TableHead>
          <TableHead className="w-100pxr text-right">예약</TableHead>
          <TableHead className="w-100pxr text-right">가용</TableHead>
          <TableHead className="w-110pxr text-right">당일 출고</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableQueryRows query={query} colSpan={8} emptyMessage="조건에 맞는 재고가 없습니다.">
          {(items) =>
            items.map((item) => (
              <TableRow key={`${item.warehouse.warehouseId}-${item.sku.skuId}`}>
                <TableCell>{item.warehouse.warehouseCode}</TableCell>
                <TableCell>{getRegionLabel(item.warehouse.regionCode)}</TableCell>
                <TableCell>{item.sku.skuCode}</TableCell>
                <TableCell className="wrap-break-word">{item.sku.productName}</TableCell>
                <TableCell className="text-right">{formatNumber(item.onHandQuantity)}</TableCell>
                <TableCell className="text-right">{formatNumber(item.reservedQuantity)}</TableCell>
                <TableCell className="text-right">{formatNumber(item.availableQuantity)}</TableCell>
                <TableCell className="text-right">{formatNumber(item.outboundQuantity)}</TableCell>
              </TableRow>
            ))
          }
        </TableQueryRows>
      </TableBody>
    </Table>
  )
}
