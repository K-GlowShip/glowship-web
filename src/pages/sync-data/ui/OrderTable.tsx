import { ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment, useState } from 'react'

import { getRegionLabel } from '@/entities/delay-event'
import type { Order } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { formatNumber } from '@/shared/lib/format-number'
import { formatYYYYMMDD, formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
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

import {
  getOrderLineStatusLabel,
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABEL,
  SALES_CHANNEL_LABEL,
} from '../model/orders'

const COLUMN_COUNT = 8

// 재고 확보일·출고 예정일·배송 예정일은 서버가 아직 계산하지 않아 항상 null이라 열을 두지 않는다.
export function OrderTable({ query }: { query: ListQuery<Order> }) {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())

  const toggle = (orderId: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (!next.delete(orderId)) {
        next.add(orderId)
      }
      return next
    })

  // 주문 번호 등을 드래그해서 복사하려는 클릭은 토글하지 않는다
  const toggleRow = (orderId: string) => {
    if (window.getSelection()?.toString()) {
      return
    }
    toggle(orderId)
  }

  return (
    <Table className="min-w-1010pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-220pxr">주문 번호</TableHead>
          <TableHead className="w-100pxr">채널</TableHead>
          <TableHead className="w-160pxr">주문 일시</TableHead>
          <TableHead className="w-130pxr">약속 배송일</TableHead>
          <TableHead className="w-130pxr">출고 창고</TableHead>
          <TableHead className="w-110pxr">고객 권역</TableHead>
          <TableHead className="w-110pxr">상태</TableHead>
          <TableHead className="w-130pxr">실제 출고일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableQueryRows
          query={query}
          colSpan={COLUMN_COUNT}
          emptyMessage="조건에 맞는 주문이 없습니다."
        >
          {(orders) =>
            orders.map((order) => {
              const isExpanded = expandedIds.has(order.orderId)
              const linesId = `order-lines-${order.orderId}`

              return (
                <Fragment key={order.orderId}>
                  {/* 행 어디를 눌러도 열리고 닫힌다. 키보드·스크린 리더는 안의 버튼을 쓰고, 그 클릭이 행으로 전달돼 한 번만 토글된다 */}
                  <TableRow className="cursor-pointer" onClick={() => toggleRow(order.orderId)}>
                    <TableCell>
                      <div className="flex items-center gap-4pxr">
                        {/* 주문 번호는 버튼 밖에 둔다. 버튼 안의 글자는 드래그로 선택·복사할 수 없다 */}
                        <button
                          type="button"
                          className="cursor-pointer rounded-control p-2pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
                          aria-expanded={isExpanded}
                          aria-controls={linesId}
                          aria-label={`${order.orderCode} 주문 상품 ${isExpanded ? '접기' : '펼치기'}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-16pxr shrink-0" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="size-16pxr shrink-0" aria-hidden="true" />
                          )}
                        </button>
                        <span>{order.orderCode}</span>
                      </div>
                    </TableCell>
                    <TableCell>{SALES_CHANNEL_LABEL[order.salesChannel]}</TableCell>
                    <TableCell>{formatYYYYMMDDHHmm(order.orderedAt)}</TableCell>
                    <TableCell>{formatYYYYMMDD(order.promisedDeliveryAt)}</TableCell>
                    <TableCell>{order.warehouse.warehouseCode}</TableCell>
                    <TableCell>{getRegionLabel(order.customerRegion)}</TableCell>
                    <TableCell>
                      <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.actualDispatchDate ?? EMPTY_VALUE}</TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow id={linesId} className="bg-background hover:bg-background">
                      <TableCell colSpan={COLUMN_COUNT}>
                        <OrderLines order={order} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })
          }
        </TableQueryRows>
      </TableBody>
    </Table>
  )
}

function OrderLines({ order }: { order: Order }) {
  if (order.lines.length === 0) {
    return <p className="text-b2 text-muted-foreground">주문 상품이 없습니다.</p>
  }

  return (
    <div className="pl-24pxr">
      <table className="w-full max-w-800pxr text-b2">
        <caption className="sr-only">{order.orderCode} 주문 상품</caption>
        <thead>
          <tr className="text-left text-muted-foreground">
            <th scope="col" className="w-48pxr py-4pxr font-normal">
              #
            </th>
            <th scope="col" className="w-140pxr py-4pxr font-normal">
              SKU 코드
            </th>
            <th scope="col" className="py-4pxr font-normal">
              상품명
            </th>
            <th scope="col" className="w-100pxr py-4pxr text-right font-normal">
              주문 수량
            </th>
            <th scope="col" className="w-100pxr py-4pxr text-right font-normal">
              출고 수량
            </th>
            <th scope="col" className="w-100pxr py-4pxr pl-16pxr font-normal">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.lineNo}>
              <td className="py-4pxr">{line.lineNo}</td>
              <td className="py-4pxr">{line.sku.skuCode}</td>
              <td className="py-4pxr wrap-break-word">{line.sku.productName}</td>
              <td className="py-4pxr text-right">{formatNumber(line.orderedQuantity)}</td>
              <td className="py-4pxr text-right">{formatNumber(line.shippedQuantity)}</td>
              <td className="py-4pxr pl-16pxr">{getOrderLineStatusLabel(line)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
