import { Info } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/shared/lib/cn'
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
import { Tooltip } from '@/shared/ui/tooltip'

import {
  addDays,
  diffDays,
  formatMonthDay,
  INVENTORY_STATUS_BADGE_VARIANT,
  INVENTORY_STATUS,
  INVENTORY_STATUS_LABEL,
  type InventoryStatus,
  REGION_LABEL,
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

/** 열 이름 옆에 정보 아이콘을 두고, 마우스를 올리거나 포커스하면 설명을 보여 준다 */
function InfoHeader({ label, description }: { label: string; description: string }) {
  return (
    <span className="inline-flex items-center gap-4pxr">
      {label}
      <Tooltip content={description}>
        <button
          type="button"
          aria-label={`${label} 설명`}
          className="cursor-pointer rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
        >
          <Info className="size-14pxr" aria-hidden="true" />
        </button>
      </Tooltip>
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
        <div className="flex flex-col gap-4pxr">
          <CardTitle as="h2">거점별 재고 현황</CardTitle>
          <p className="text-caption text-muted-foreground">
            {formatMonthDay(baseDate)} 기준으로 계산한 참고값이며, 입고 예정은 반영하지 않았습니다.
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-16pxr pt-16pxr">
        <div className="overflow-x-auto">
          <Table className="min-w-720pxr">
            <TableHeader>
              <TableRow>
                <TableHead className="w-380pxr">거점 / 상품</TableHead>
                <TableHead>가용 재고(개)</TableHead>
                <TableHead>
                  <InfoHeader
                    label="일 판매량(개)"
                    description={`최근 ${inventory.salesBasisDays}일 평균 판매량입니다.`}
                  />
                </TableHead>
                <TableHead>
                  <InfoHeader
                    label="안전재고 하회"
                    description={`안전재고는 하루 판매량의 ${inventory.safetyStockDays}일분입니다. 재고가 이 수량 밑으로 처음 내려가는 날짜를 보여 줍니다.`}
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
                  <TableCell>{item.availableQuantity.toLocaleString('ko-KR')}</TableCell>
                  <TableCell>{item.averageDailySales.toLocaleString('ko-KR')}</TableCell>
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
