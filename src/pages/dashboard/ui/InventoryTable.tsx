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
    <Card className="border-primary-100">
      <CardHeader>
        <div className="flex items-center gap-8pxr">
          <CardTitle as="h2">거점별 재고 현황</CardTitle>
          <InfoTip
            label="거점별 재고 현황"
            // 기준일·판매량 기간·입고 예정 미반영은 오른쪽 줄이 이미 알리므로, 거기 없는 내용(계산 방식과 다른 화면과의 차이)만 적는다
            description={`현재 재고를 평균 판매량으로 소진한다고 가정한 날짜입니다.\n입고를 반영한 날짜는 지연 대응 센터에서 확인하세요.`}
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
                <TableHead className="w-320pxr">상품 · 거점</TableHead>
                {/* 수량은 자릿수를 비교하기 쉽게 오른쪽으로 맞춘다 */}
                <TableHead className="text-right">가용 재고(개)</TableHead>
                <TableHead className="text-right">평균 일 판매량(개)</TableHead>
                <TableHead>
                  <InfoHeader
                    label={`안전재고${safetyStockDays === null ? '' : `(${safetyStockDays}일분)`} 하회`}
                    description="가용 재고가 이 수량 밑으로 처음 내려가는 날짜입니다."
                  />
                </TableHead>
                <TableHead>
                  <InfoHeader
                    label="소진 예상"
                    description={`막대는 소진까지 남은 일수입니다.${safetyStockDays === null ? '' : `\n세로선은 안전재고 일수(${safetyStockDays}일)이고, 막대가 선에 못 미치면 안전재고보다 적게 남은 것입니다.`}`}
                  />
                </TableHead>
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
                        {/* 상품이 먼저 읽히고, 어느 거점의 재고인지는 아래에 흐리게 둔다 */}
                        <p className="truncate font-bold">{item.sku.productName}</p>
                        <p className="text-caption text-muted-foreground">
                          {getRegionLabel(item.warehouse.regionCode)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.availableQuantity)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.averageDailySales)}
                      </TableCell>
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

/**
 * 소진까지 남은 일수(D-day)와 안전재고 일수 대비 남은 정도를 막대로 보여 준다.
 * 막대 위 세로선이 안전재고 일수 자리라서, 막대가 선에 못 미치면 안전재고보다 적게 남은 것이다.
 */
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
    return <>{EMPTY_VALUE}</>
  }
  const daysLeft = Math.max(diffDays(baseDate, item.stockoutDate), 0)
  // 안전재고 일수를 모르면 막대를 채울 기준이 없어 비워 둔다
  const ratio = safetyStockDays ? Math.min(daysLeft / (safetyStockDays * BAR_FULL_MULTIPLE), 1) : 0

  return (
    <div className="flex flex-col gap-6pxr">
      <span className="flex items-center gap-8pxr">
        {formatMMDD(item.stockoutDate)}
        {/* 위험도는 같은 줄의 상태 배지와 아래 막대 색이 알리므로, 남은 일수는 색 없이 적는다 */}
        <span className="text-caption text-muted-foreground tabular-nums">D-{daysLeft}</span>
      </span>
      <span className="relative h-6pxr w-120pxr" aria-hidden="true">
        <span className="absolute inset-0 overflow-hidden rounded-full bg-disabled">
          <span
            className={cn(
              'block h-full origin-left animate-grow-x rounded-full motion-reduce:animate-none',
              STATUS_BAR_COLOR[item.status],
            )}
            style={{ width: `${Math.max(ratio, 0.06) * 100}%` }}
          />
        </span>
        {safetyStockDays !== null && (
          <span
            className="absolute -inset-y-2pxr w-2pxr rounded-full bg-input"
            style={{ left: `${100 / BAR_FULL_MULTIPLE}%` }}
          />
        )}
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
