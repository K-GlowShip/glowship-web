import { Sparkles } from 'lucide-react'
import { Fragment } from 'react'

import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import {
  type DelayOption,
  FEASIBILITY_BADGE_VARIANT,
  FEASIBILITY_LABEL,
  formatMonthDay,
  OPTION_TYPE_LABEL,
  REASON_LABEL,
} from '../model/delay-center'

interface OptionTableProps {
  options: DelayOption[]
}

const COLUMN_COUNT = 6
const EMPTY = '—'

/** 불가·확인 필요인 대응안도 숨기지 않고 사유를 함께 보여 준다. 판정할 수 없는 값은 '—'로 표시한다. */
export function OptionTable({ options }: OptionTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table density="compact" className="min-w-680pxr">
        <TableHeader>
          <TableRow>
            <TableHead className="w-170pxr">대응안</TableHead>
            <TableHead className="w-120pxr">실행 가능 여부</TableHead>
            <TableHead className="w-88pxr">예상 도착</TableHead>
            <TableHead className="w-96pxr">커버 수량</TableHead>
            <TableHead className="w-88pxr">회복 주문</TableHead>
            <TableHead className="w-116pxr">남은 위험 주문</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((option) => (
            <Fragment key={option.id}>
              <TableRow
                className={cn(
                  option.recommended && 'bg-primary-100',
                  option.explanation && 'border-b-0',
                )}
              >
                <TableCell className="font-bold text-primary">
                  <span className="inline-flex items-center gap-6pxr">
                    {option.recommended && <Sparkles className="size-14pxr" aria-label="AI 추천" />}
                    {OPTION_TYPE_LABEL[option.type]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-4pxr">
                    <Badge variant={FEASIBILITY_BADGE_VARIANT[option.feasibility]} dot={false}>
                      {FEASIBILITY_LABEL[option.feasibility]}
                    </Badge>
                    {option.reasonCode && (
                      <span className="text-caption text-muted-foreground">
                        {REASON_LABEL[option.reasonCode]}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {option.expectedArrival ? formatMonthDay(option.expectedArrival) : EMPTY}
                </TableCell>
                <TableCell>
                  {option.securableQuantity === null
                    ? EMPTY
                    : `${option.securableQuantity.toLocaleString()}개`}
                </TableCell>
                <TableCell>
                  {option.recoveredOrders === null ? EMPTY : `${option.recoveredOrders}건`}
                </TableCell>
                <TableCell>
                  {option.remainingRiskOrders === null ? EMPTY : `${option.remainingRiskOrders}건`}
                </TableCell>
              </TableRow>
              {option.explanation && (
                <TableRow className={cn(option.recommended && 'bg-primary-100')}>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="pt-0 pb-12pxr text-b2 text-muted-foreground"
                  >
                    {option.explanation}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
