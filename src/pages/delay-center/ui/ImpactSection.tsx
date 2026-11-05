import { cn } from '@/shared/lib/cn'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { InfoTip } from '@/shared/ui/tooltip'

import {
  type DelayAnalysis,
  formatMonthDay,
  getIncreasedShortage,
  getVisibleImpacts,
  RESULT_CLASS,
  RESULT_CLASS_LABEL,
  type SkuImpact,
  WAREHOUSE_LABEL,
} from '../model/delay-center'
import { EMPTY_VALUE } from '@/shared/config'

const NOT_ESTIMABLE_TEXT = '재고·판매 자료가 부족해 판정할 수 없습니다.'
// 명세 4.5: 일부 SKU만 판정 불가여도 실행은 계속되고, 판정 불가 SKU만 계산에서 빠진다. 자료를 보완한 뒤 재분석을 요청해야 반영된다
const NOT_ESTIMABLE_DESCRIPTION = [
  '이 상품은 계산에서 제외되어 요약의 부족 수량에도 들어가지 않습니다.',
  '나머지 상품의 결과로 대응안을 비교할 수 있습니다.',
  '자료를 보완한 뒤 재분석을 요청하면 반영됩니다.',
].join('\n')
interface ImpactSectionProps {
  analysis: DelayAnalysis
}

/**
 * 상품(SKU·창고)별 재고 영향의 정확한 숫자와 날짜를 한 표로 보여 준다. 위쪽 지연 개요 카드의 날짜 축에는
 * 같은 순서로 상품별 위치만 그려져 있다. 판정할 수 없는 값은 '–'로 표시한다.
 */
export function ImpactSection({ analysis }: ImpactSectionProps) {
  const impacts = getVisibleImpacts(analysis.impacts)

  return (
    <section aria-labelledby="impact-title" className="flex flex-col gap-16pxr">
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h3 id="impact-title" className="text-h3 font-bold">
          상품별 재고 영향
        </h3>
        <p className="text-b2 text-muted-foreground">{summaryText(analysis)}</p>
      </div>

      {impacts.length > 0 && <ImpactTable impacts={impacts} />}
    </section>
  )
}

// 명세 4.5 "재고 영향 읽는 법": 지연 증분 = 전체(예상 입고일) 부족 − 기준선(계획 입고일) 부족
const SHORTAGE_DESCRIPTION = [
  '지연 때문에 원래 계획보다 부족해진 수량입니다.',
  '계획대로 입고되어도 있었을 부족은 포함하지 않습니다.',
  '재고·미출고 확정 수량·최근 28일 평균 판매량으로 계산한 예측값입니다.',
  '산출식: (예상 입고일 기준 부족 수량) - (계획 입고일 기준 부족 수량)',
].join('\n')

const summaryText = ({ impacts, resultClass, riskOrders }: DelayAnalysis) => {
  switch (resultClass) {
    case RESULT_CLASS.FORECAST_ONLY_READY:
    case RESULT_CLASS.READY_ORDER_RISK:
      // 위험 주문 → 부족 수량 순서로 고정한다. 없다는 말은 안심할 내용이라 중립색으로 두고, 있을 때만 경고색으로 강조한다
      return (
        <>
          <span className={cn(riskOrders.length > 0 && 'text-danger')}>
            지연으로 인한 위험 주문 {riskOrders.length > 0 ? `${riskOrders.length}건` : '없음'}
          </span>
          {' · '}
          <span className="text-danger">
            부족 수량 {getIncreasedShortage(impacts).toLocaleString()}개
          </span>
        </>
      )
    case RESULT_CLASS.PURE_NO_RISK:
    case RESULT_CLASS.WARNING_NO_RISK:
      return RESULT_CLASS_LABEL[resultClass]
  }
}

const getImpactKey = ({ skuCode, region }: SkuImpact) => `${skuCode}-${region}`

function ImpactTable({ impacts }: { impacts: SkuImpact[] }) {
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
