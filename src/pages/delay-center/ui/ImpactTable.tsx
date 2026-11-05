import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { InfoTip } from '@/shared/ui/tooltip'

import { formatMonthDay, type SkuImpact, WAREHOUSE_LABEL } from '../model/delay-center'

// 명세 4.5 "재고 영향 읽는 법": 지연 증분 = 전체(예상 입고일) 부족 − 기준선(계획 입고일) 부족
const SHORTAGE_DESCRIPTION = [
  '지연 때문에 원래 계획보다 부족해진 수량입니다.',
  '계획대로 입고되어도 있었을 부족은 포함하지 않습니다.',
  '재고·미출고 확정 수량·최근 28일 평균 판매량으로 계산한 예측값입니다.',
  '산출식: (예상 입고일 기준 부족 수량) - (계획 입고일 기준 부족 수량)',
].join('\n')

const NOT_ESTIMABLE_TEXT = '재고·판매 자료가 부족해 판정할 수 없습니다.'
// 명세 4.5: 일부 SKU만 판정 불가여도 실행은 계속되고, 판정 불가 SKU만 계산에서 빠진다. 자료를 보완한 뒤 재분석을 요청해야 반영된다
const NOT_ESTIMABLE_DESCRIPTION = [
  '이 상품은 계산에서 제외되어 요약의 부족 수량에도 들어가지 않습니다.',
  '나머지 상품의 결과로 대응안을 비교할 수 있습니다.',
  '자료를 보완한 뒤 재분석을 요청하면 반영됩니다.',
].join('\n')

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
                <InfoTip label="부족 수량" description={SHORTAGE_DESCRIPTION} />
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
                    {(impact.increasedShortage ?? 0).toLocaleString()}개
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
                    {NOT_ESTIMABLE_TEXT}
                    <InfoTip label="판정할 수 없는 상품" description={NOT_ESTIMABLE_DESCRIPTION} />
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
