import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD } from '@/shared/lib/kst-date'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { InfoTip } from '@/shared/ui/tooltip'

import { type SkuImpact, WAREHOUSE_LABEL } from '../model/delay-center'
import { IMPACT_TEXT } from '../model/delay-center-text'

const getImpactKey = ({ skuCode, region }: SkuImpact) => `${skuCode}-${region}`

interface ImpactTableProps {
  impacts: SkuImpact[]
}

/** 상품(SKU·창고)별 부족 수량과 안전재고 하회·재고 소진 날짜, 품절 일수. 판정할 수 없는 상품은 한 칸으로 합쳐 안내한다. */
export function ImpactTable({ impacts }: ImpactTableProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  // 지연으로 부족이 늘었거나 판정할 수 없는 상품을 먼저 보여 준다. 나머지(안전재고 하회만 있는 상품)는 접어 둔다
  const primary = impacts.filter(
    (impact) => !impact.estimable || (impact.increasedShortage ?? 0) > 0,
  )
  // 부족이 늘어난 상품이 하나도 없으면 접을 기준이 없어 모두 보여 준다
  const canCollapse = primary.length > 0 && primary.length < impacts.length
  const rows = canCollapse && !isExpanded ? primary : impacts

  return (
    <div className="flex flex-col gap-8pxr overflow-x-auto">
      <Table density="compact" className="min-w-640pxr">
        <TableHeader>
          <TableRow>
            <TableHead>상품</TableHead>
            <TableHead className="w-120pxr text-right">
              <span className="inline-flex items-center justify-end gap-4pxr">
                부족 수량
                <InfoTip label="부족 수량" description={IMPACT_TEXT.SHORTAGE_DESCRIPTION} />
              </span>
              <span className="block text-caption font-normal text-muted-foreground">
                (지연 영향)
              </span>
            </TableHead>
            <TableHead className="w-130pxr pl-32pxr">안전재고 하회</TableHead>
            <TableHead className="w-96pxr">재고 소진</TableHead>
            <TableHead className="w-96pxr">품절 일수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((impact) => (
            <TableRow key={getImpactKey(impact)}>
              <TableCell>
                <span className="font-bold">{impact.productName}</span>{' '}
                <span className="text-muted-foreground">
                  {impact.skuCode} · {WAREHOUSE_LABEL[impact.region]}
                </span>
              </TableCell>
              {impact.estimable ? (
                <>
                  <TableCell
                    className={cn(
                      'text-right tabular-nums',
                      (impact.increasedShortage ?? 0) > 0
                        ? 'font-bold text-danger'
                        : 'text-muted-foreground',
                    )}
                  >
                    {formatNumber(impact.increasedShortage ?? 0)}개
                  </TableCell>
                  <TableCell className="pl-32pxr">
                    {impact.safetyStockBreachDate
                      ? formatMMDD(impact.safetyStockBreachDate)
                      : EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    {impact.stockoutDate ? formatMMDD(impact.stockoutDate) : EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    {impact.stockoutDays ? `${impact.stockoutDays}일` : EMPTY_VALUE}
                  </TableCell>
                </>
              ) : (
                <TableCell colSpan={4} className="text-warning">
                  <span className="inline-flex items-center gap-4pxr">
                    {IMPACT_TEXT.NOT_ESTIMABLE}
                    <InfoTip
                      label="판정할 수 없는 상품"
                      description={IMPACT_TEXT.NOT_ESTIMABLE_DESCRIPTION}
                    />
                  </span>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {canCollapse && (
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((previous) => !previous)}
          className="flex w-fit cursor-pointer items-center gap-4pxr rounded-control px-12pxr py-4pxr text-b2 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
        >
          <ChevronDown
            className={cn('size-14pxr transition-transform', isExpanded && 'rotate-180')}
            aria-hidden="true"
          />
          {isExpanded ? '접기' : `나머지 상품 ${impacts.length - primary.length}개 보기`}
        </button>
      )}
    </div>
  )
}
