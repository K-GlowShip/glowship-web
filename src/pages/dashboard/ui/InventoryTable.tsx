import { useState } from 'react'

import { REGION_LABEL } from '@/entities/delay-event'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { InfoTip } from '@/shared/ui/tooltip'

import {
  addDays,
  diffDays,
  formatMonthDay,
  INVENTORY_STATUS_BADGE_VARIANT,
  INVENTORY_STATUS,
  INVENTORY_STATUS_LABEL,
  type InventoryStatus,
  type InventoryItem,
  type InventoryStatusResult,
} from '../model/dashboard'

// 명세 공통 규칙: 목록은 page·size를 받는다. 서버가 위험 순으로 정렬해 주므로 1페이지에 급한 행이 모인다
const PAGE_SIZE = 5

const STATUS_BAR_COLOR: Record<InventoryStatus, string> = {
  [INVENTORY_STATUS.RISK]: 'bg-danger',
  [INVENTORY_STATUS.CAUTION]: 'bg-warning',
  [INVENTORY_STATUS.OK]: 'bg-success',
}

/** 막대가 가득 차는 기준: 안전재고 일수의 이 배수만큼 남았을 때 */
const BAR_FULL_MULTIPLE = 3

/** 소진까지 남은 일수(D-day)와 안전재고 일수 대비 남은 정도를 막대로 보여 준다 */
function StockoutCell({
  item,
  baseDate,
  safetyStockDays,
}: {
  item: InventoryItem
  baseDate: string
  safetyStockDays: number
}) {
  if (!item.stockoutDate) {
    return <>-</>
  }
  const daysLeft = Math.max(diffDays(baseDate, item.stockoutDate), 0)
  const ratio = Math.min(daysLeft / (safetyStockDays * BAR_FULL_MULTIPLE), 1)

  return (
    <div className="flex flex-col gap-4pxr">
      <span>
        {formatMonthDay(item.stockoutDate)}{' '}
        <span className="text-caption text-muted-foreground">D-{daysLeft}</span>
      </span>
      <span className="h-4pxr w-80pxr overflow-hidden rounded-full bg-disabled" aria-hidden="true">
        <span
          className={cn('block h-full rounded-full', STATUS_BAR_COLOR[item.status])}
          style={{ width: `${Math.max(ratio, 0.06) * 100}%` }}
        />
      </span>
    </div>
  )
}

/** 열 이름 옆에 정보 아이콘을 둔다 */
function InfoHeader({ label, description }: { label: string; description: string }) {
  return (
    <span className="inline-flex items-center gap-4pxr">
      {label}
      <InfoTip label={label} description={description} />
    </span>
  )
}

/** 서버 연동 후에는 화면에서 자르지 않고 page·size를 요청으로 보낸다 */
export function InventoryTable({ inventory }: { inventory: InventoryStatusResult }) {
  const [requestedPage, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(inventory.items.length / PAGE_SIZE))
  // 데이터가 줄어 요청한 페이지가 사라져도 빈 페이지가 보이지 않게 한다
  const page = Math.min(requestedPage, pageCount)
  const baseDate = addDays(inventory.inventoryDate, 1)
  const pageItems = inventory.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-8pxr">
          <CardTitle as="h2">거점별 재고 현황</CardTitle>
          <InfoTip
            label="거점별 재고 현황"
            description={`현재 재고와 평균 판매량으로 계산한 예측입니다.\n입고 예정과 지연은 반영하지 않아 지연 분석 결과와 다를 수 있습니다.`}
          />
        </div>
        <dl className="flex flex-wrap justify-end gap-x-16pxr gap-y-2pxr text-caption">
          <div className="flex gap-6pxr">
            <dt className="text-muted-foreground">기준일</dt>
            <dd>{formatMonthDay(baseDate)}</dd>
          </div>
          <div className="flex gap-6pxr">
            <dt className="text-muted-foreground">판매량 기간</dt>
            <dd>최근 {inventory.salesBasisDays}일</dd>
          </div>
          {/* 명세 4.4: 이 값이 입고 예정을 반영하지 않은 참고값임을 기준과 함께 화면에 보여 준다 */}
          <div className="flex gap-6pxr">
            <dt className="text-muted-foreground">입고 예정</dt>
            <dd>미반영</dd>
          </div>
        </dl>
      </CardHeader>
      <CardContent className="flex flex-col gap-16pxr pt-16pxr">
        <div className="overflow-x-auto">
          <Table className="min-w-720pxr">
            <TableHeader>
              <TableRow>
                <TableHead className="w-380pxr">거점 / 상품</TableHead>
                <TableHead>가용 재고(개)</TableHead>
                <TableHead>평균 일 판매량(개)</TableHead>
                <TableHead>
                  <InfoHeader
                    label={`안전재고(${inventory.safetyStockDays}일분) 하회`}
                    description="가용 재고가 이 수량 밑으로 처음 내려가는 날짜입니다."
                  />
                </TableHead>
                <TableHead>소진 예상</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.items.length === 0 && (
                <TableEmptyRow colSpan={6}>재고 현황이 없습니다.</TableEmptyRow>
              )}
              {pageItems.map((item) => (
                // 같은 거점·상품은 한 행이다(명세 4.4)
                <TableRow key={`${item.warehouseId}-${item.skuId}`}>
                  <TableCell>
                    {REGION_LABEL[item.warehouseRegion]} / {item.productName}
                  </TableCell>
                  <TableCell>{formatNumber(item.availableQuantity)}</TableCell>
                  <TableCell>{formatNumber(item.averageDailySales)}</TableCell>
                  <TableCell>{formatMonthDay(item.safetyStockBreachDate)}</TableCell>
                  <TableCell>
                    <StockoutCell
                      item={item}
                      baseDate={baseDate}
                      safetyStockDays={inventory.safetyStockDays}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={INVENTORY_STATUS_BADGE_VARIANT[item.status]}>
                      {INVENTORY_STATUS_LABEL[item.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </CardContent>
    </Card>
  )
}
