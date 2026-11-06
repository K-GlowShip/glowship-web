import { Fragment } from 'react'

import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import {
  type AiExplanation,
  type DelayOption,
  FEASIBILITY_BADGE_VARIANT,
  FEASIBILITY_LABEL,
  formatMonthDay,
  OPTION_TYPE_LABEL,
  REASON_LABEL,
} from '../model/delay-center'
import { RecommendedBadge } from './RecommendedBadge'

interface OptionTableProps {
  options: DelayOption[]
  /** AI 설명. 생성에 실패했으면 null이고 대응안별 설명과 추천 근거가 없다. */
  explanation: AiExplanation | null
}

const COLUMN_COUNT = 6
/** 추천 대응안은 배경색 대신 행 왼쪽의 가는 선으로 구분한다. 이름 줄과 추천 근거 줄에 같이 붙여 한 덩어리로 보이게 한다. */
const ACCENT_CLASS = 'shadow-[inset_3px_0_0_var(--color-primary)]'

/**
 * 대응안 하나의 근거는 그 행 바로 아래 한 곳에 모은다. 서버가 계산한 사유(`reasonCode`) 라벨을 먼저 두고,
 * 그 뒤에 AI의 대응안별 설명을 덧붙인다(설명 생성이 실패했으면 사유만). 배지 아래에는 사유를 따로 적지 않는다.
 * 추천 대응안은 설명 뒤에 순위 기준(추천 근거)이 이어진다.
 * 불가·확인 필요인 대응안도 숨기지 않으며, 판정할 수 없는 값은 '–'로 표시한다.
 */
export function OptionTable({ options, explanation }: OptionTableProps) {
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
          {options.map((option) => {
            const evidence = getEvidence(option, explanation)

            return (
              <Fragment key={option.id}>
                <TableRow className={cn(evidence && 'border-b-0')}>
                  <TableCell className={cn(option.recommended && ACCENT_CLASS)}>
                    <div className="flex flex-col items-start gap-4pxr">
                      {option.recommended && <RecommendedBadge />}
                      <span className="font-bold">{OPTION_TYPE_LABEL[option.type]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={FEASIBILITY_BADGE_VARIANT[option.feasibility]} dot={false}>
                      {FEASIBILITY_LABEL[option.feasibility]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {option.expectedArrival ? formatMonthDay(option.expectedArrival) : EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    {option.securableQuantity === null
                      ? EMPTY_VALUE
                      : `${formatNumber(option.securableQuantity)}개`}
                  </TableCell>
                  <TableCell>
                    {option.delayInducedRecoveredOrders === null
                      ? EMPTY_VALUE
                      : `${option.delayInducedRecoveredOrders}건`}
                  </TableCell>
                  <TableCell>
                    {option.notRecoveredOrders === null ? (
                      EMPTY_VALUE
                    ) : (
                      <div className="flex flex-col items-start gap-4pxr">
                        <span>{option.notRecoveredOrders}건</span>
                        {!!option.itemSecuredBlockedOrders && (
                          <span className="text-caption text-muted-foreground">
                            그중 일부 품목만 확보 {option.itemSecuredBlockedOrders}건
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
                {evidence && (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMN_COUNT}
                      className={cn(
                        'pt-0 pb-12pxr text-b2 text-muted-foreground',
                        option.recommended && ACCENT_CLASS,
                      )}
                    >
                      <div className="flex flex-col gap-4pxr">
                        {evidence.reason && <p>{evidence.reason}</p>}
                        {evidence.explanation && <p>{evidence.explanation}</p>}
                        {evidence.recommendation && (
                          <p>
                            <span className="font-bold text-foreground">추천 근거</span>{' '}
                            {evidence.recommendation}
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

interface OptionEvidence {
  /** 서버가 계산한 사유 코드(`reasonCode`)의 라벨. AI 설명과 상관없이 항상 보여 준다. */
  reason: string | null
  explanation: string | null
  /** 추천 대응안에만 있다 */
  recommendation: string | null
}

/** 행 아래에 보여 줄 근거. 사유·설명·추천 근거가 모두 없으면 줄을 만들지 않는다. */
const getEvidence = (
  option: DelayOption,
  explanation: AiExplanation | null,
): OptionEvidence | null => {
  const evidence = {
    reason: option.reasonCode ? REASON_LABEL[option.reasonCode] : null,
    explanation: explanation?.optionExplanations[option.type] ?? null,
    recommendation: option.recommended ? (explanation?.recommendation ?? null) : null,
  }
  return evidence.reason || evidence.explanation || evidence.recommendation ? evidence : null
}
