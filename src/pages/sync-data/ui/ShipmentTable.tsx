import type { Shipment } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import {
  getShipmentDelayLabel,
  SHIPMENT_STAGE_BADGE_VARIANT,
  SHIPMENT_STAGE_LABEL,
  TRANSPORT_MODE_LABEL,
} from '../model/shipments'

/** 대표 상품과 나머지 품목 수. 예: "SKU-001 외 19종" */
const formatRepresentativeSku = ({ representativeSku, skuCount }: Shipment) => {
  if (!representativeSku) {
    return EMPTY_VALUE
  }
  return skuCount > 1
    ? `${representativeSku.skuCode} 외 ${skuCount - 1}종`
    : representativeSku.skuCode
}

export function ShipmentTable({ shipments }: { shipments: Shipment[] }) {
  return (
    <Table className="min-w-1380pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="w-160pxr">선적 코드</TableHead>
          <TableHead className="w-90pxr">운송</TableHead>
          <TableHead className="min-w-170pxr">경로</TableHead>
          <TableHead className="w-130pxr">도착 창고</TableHead>
          <TableHead className="w-160pxr">대표 상품</TableHead>
          <TableHead className="w-140pxr">단계</TableHead>
          <TableHead className="w-100pxr">계획 출고</TableHead>
          <TableHead className="w-100pxr">계획 입고</TableHead>
          <TableHead className="w-100pxr">예상 입고</TableHead>
          <TableHead className="w-100pxr">실제 입고</TableHead>
          <TableHead className="w-130pxr">지연</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shipments.length === 0 && (
          <TableEmptyRow colSpan={11}>조건에 맞는 선적이 없습니다.</TableEmptyRow>
        )}
        {shipments.map((shipment) => (
          <TableRow key={shipment.shipmentId}>
            <TableCell className="whitespace-nowrap">{shipment.shipmentCode}</TableCell>
            <TableCell className="whitespace-nowrap">
              {TRANSPORT_MODE_LABEL[shipment.transportMode]}
            </TableCell>
            <TableCell className="whitespace-nowrap">{shipment.route}</TableCell>
            <TableCell className="whitespace-nowrap">{shipment.warehouse.warehouseCode}</TableCell>
            <TableCell>{formatRepresentativeSku(shipment)}</TableCell>
            <TableCell>
              <Badge variant={SHIPMENT_STAGE_BADGE_VARIANT[shipment.stage]}>
                {SHIPMENT_STAGE_LABEL[shipment.stage]}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap">{shipment.plannedKrReleaseDate}</TableCell>
            <TableCell className="whitespace-nowrap">{shipment.planned3plInboundDate}</TableCell>
            <TableCell className="whitespace-nowrap">{shipment.expected3plInboundDate}</TableCell>
            <TableCell className="whitespace-nowrap">
              {shipment.actual3plInboundDate ?? EMPTY_VALUE}
            </TableCell>
            <TableCell>
              <Badge variant={shipment.isDelayed ? 'danger' : 'success'}>
                {getShipmentDelayLabel(shipment)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
