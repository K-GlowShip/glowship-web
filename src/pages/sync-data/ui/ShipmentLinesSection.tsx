import { useState } from 'react'

import type { ShipmentLine } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import { getTotalShippedQuantity } from '../model/shipment-detail'

/** 접힌 상태에서 보여 주는 줄 수 */
const COLLAPSED_ROW_COUNT = 5

const CELL_CLASS = 'px-12pxr py-7pxr'

interface ShipmentLinesSectionProps {
  lines: ShipmentLine[]
  /** 표의 펼침 버튼이 가리키는 표 id */
  tableId: string
}

/**
 * 상품 줄. 줄 번호 순 그대로, 한 줄에 상품 코드와 이름을 함께 둔다.
 * 한 선적에 20줄이 넘기도 해서 처음 몇 줄만 보이고 나머지는 펼친다. 합계는 캡션에 한 번만.
 */
export function ShipmentLinesSection({ lines, tableId }: ShipmentLinesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hiddenCount = lines.length - COLLAPSED_ROW_COUNT
  const visibleLines = isExpanded || hiddenCount <= 0 ? lines : lines.slice(0, COLLAPSED_ROW_COUNT)

  return (
    <section className="flex flex-col gap-12pxr">
      <div className="flex items-baseline justify-between gap-12pxr">
        <h3 className="text-b1 font-bold">상품</h3>
        <p className="text-caption text-muted-foreground">
          {formatNumber(lines.length)}줄 · 합계 {formatNumber(getTotalShippedQuantity(lines))}개
        </p>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-card border border-dashed border-border py-20pxr text-center text-b2 text-muted-foreground">
          상품 줄이 없습니다.
        </p>
      ) : (
        <>
          <Table id={tableId} density="compact">
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="w-48pxr py-10pxr text-right">
                  줄
                </TableHead>
                <TableHead scope="col" className="py-10pxr">
                  상품
                </TableHead>
                <TableHead scope="col" className="w-96pxr py-10pxr text-right">
                  수량
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleLines.map((line) => (
                <TableRow key={line.lineNo}>
                  <TableCell
                    className={cn(CELL_CLASS, 'text-right text-muted-foreground tabular-nums')}
                  >
                    {line.lineNo}
                  </TableCell>
                  <TableCell className={cn(CELL_CLASS, 'truncate')} title={line.sku.productName}>
                    <span className="mr-8pxr text-b2 text-muted-foreground tabular-nums">
                      {line.sku.skuCode}
                    </span>
                    {line.sku.productName}
                  </TableCell>
                  <TableCell className={cn(CELL_CLASS, 'text-right tabular-nums')}>
                    {formatNumber(line.shippedQuantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hiddenCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="self-start px-0"
              aria-expanded={isExpanded}
              aria-controls={tableId}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              {isExpanded
                ? `처음 ${COLLAPSED_ROW_COUNT}줄만 보기`
                : `나머지 ${formatNumber(hiddenCount)}줄 보기`}
            </Button>
          )}
        </>
      )}
    </section>
  )
}
