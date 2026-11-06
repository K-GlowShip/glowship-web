import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { InfoTip } from '@/shared/ui/tooltip'

import { formatMonthDay, type SkuImpact, WAREHOUSE_LABEL } from '../model/delay-center'
import { IMPACT_TEXT } from '../model/delay-center-text'

const getImpactKey = ({ skuCode, region }: SkuImpact) => `${skuCode}-${region}`

interface ImpactTableProps {
  impacts: SkuImpact[]
}

/** 상품(SKU·창고)별 부족 수량과 안전재고 하회·재고 소진 날짜, 품절 일수. 판정할 수 없는 상품은 한 칸으로 합쳐 안내한다. */
export function ImpactTable({ impacts }: ImpactTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table density="compact" className="min-w-640pxr">
        <TableHeader>
          <TableRow>
            <TableHead>상품</TableHead>
            <TableHead className="w-120pxr">
              <span className="inline-flex items-center gap-4pxr">
                부족 수량
                <InfoTip label="부족 수량" description={IMPACT_TEXT.SHORTAGE_DESCRIPTION} />
              </span>
              <span className="block text-caption font-normal text-muted-foreground">
                (지연 영향)
              </span>
            </TableHead>
            <TableHead className="w-110pxr">안전재고 하회</TableHead>
            <TableHead className="w-96pxr">재고 소진</TableHead>
            <TableHead className="w-96pxr">품절 일수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {impacts.map((impact) => (
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
                    className={cn((impact.increasedShortage ?? 0) > 0 && 'font-bold text-danger')}
                  >
                    {formatNumber(impact.increasedShortage ?? 0)}개
                  </TableCell>
                  <TableCell>
                    {impact.safetyStockBreachDate
                      ? formatMonthDay(impact.safetyStockBreachDate)
                      : EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    {impact.stockoutDate ? formatMonthDay(impact.stockoutDate) : EMPTY_VALUE}
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
    </div>
  )
}
