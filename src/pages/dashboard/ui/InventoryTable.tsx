import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getRegionLabel } from '@/entities/delay-event'
import {
  INVENTORY_STATUS,
  inventoryStatusQueries,
  type InventoryStatus,
  type InventoryStatusItem,
} from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { addDays, formatMMDD } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableQueryRows,
  TableRow,
} from '@/shared/ui/table'
import { InfoTip } from '@/shared/ui/tooltip'

import {
  diffDays,
  INVENTORY_PAGE_SIZE,
  INVENTORY_STATUS_BADGE_VARIANT,
  INVENTORY_STATUS_LABEL,
} from '../model/dashboard'

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
  item: InventoryStatusItem
  baseDate: string | null
  safetyStockDays: number | null
}) {
  if (!item.stockoutDate || !baseDate) {
    return <>-</>
  }
  const daysLeft = Math.max(diffDays(baseDate, item.stockoutDate), 0)
  // 안전재고 일수를 모르면 막대를 채울 기준이 없어 비워 둔다
  const ratio = safetyStockDays ? Math.min(daysLeft / (safetyStockDays * BAR_FULL_MULTIPLE), 1) : 0

  return (
    <div className="flex flex-col gap-4pxr">
      <span>
        {formatMMDD(item.stockoutDate)}{' '}
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

export function InventoryTable() {
  const [page, setPage] = useState(1)
  const query = useQuery(inventoryStatusQueries.list({ page, size: INVENTORY_PAGE_SIZE }))
  const { data } = query
  // 계산 기준일은 마지막 재고 일자 + 1일이다. 재고가 없으면 null
  const baseDate = data?.inventoryDate ? addDays(data.inventoryDate, 1) : null
  // 불러오기 전이거나 적용할 운영 기준이 없으면 null
  const salesBasisDays = data?.salesBasisDays ?? null
  const safetyStockDays = data?.safetyStockDays ?? null

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
            <dd>{formatMMDD(baseDate)}</dd>
          </div>
          <div className="flex gap-6pxr">
            <dt className="text-muted-foreground">판매량 기간</dt>
            <dd>{salesBasisDays === null ? EMPTY_VALUE : `최근 ${salesBasisDays}일`}</dd>
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
                    label={`안전재고${safetyStockDays === null ? '' : `(${safetyStockDays}일분)`} 하회`}
                    description="가용 재고가 이 수량 밑으로 처음 내려가는 날짜입니다."
                  />
                </TableHead>
                <TableHead>소진 예상</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableQueryRows query={query} colSpan={6} emptyMessage="재고 현황이 없습니다.">
                {(items) =>
                  items.map((item) => (
                    // 같은 거점·상품은 한 행이다(명세 4.4)
                    <TableRow key={`${item.warehouse.warehouseId}-${item.sku.skuId}`}>
                      <TableCell>
                        {getRegionLabel(item.warehouse.regionCode)} / {item.sku.productName}
                      </TableCell>
                      <TableCell>{formatNumber(item.availableQuantity)}</TableCell>
                      <TableCell>{formatNumber(item.averageDailySales)}</TableCell>
                      <TableCell>{formatMMDD(item.safetyStockBreachDate)}</TableCell>
                      <TableCell>
                        <StockoutCell
                          item={item}
                          baseDate={baseDate}
                          safetyStockDays={safetyStockDays}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={INVENTORY_STATUS_BADGE_VARIANT[item.status]}>
                          {INVENTORY_STATUS_LABEL[item.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableQueryRows>
            </TableBody>
          </Table>
        </div>
        {data && (
          <Pagination page={page} pageCount={Math.max(1, data.totalPages)} onPageChange={setPage} />
        )}
      </CardContent>
    </Card>
  )
}
