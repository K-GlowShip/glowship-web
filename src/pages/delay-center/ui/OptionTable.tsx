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
  /** AI 설명의 추천 근거. 추천 대응안의 행 아래에 보여 준다. */
  recommendation: string | null
}

const COLUMN_COUNT = 6
const EMPTY = '—'

/** 추천 대응안은 배경색 대신 행 왼쪽의 가는 선으로 구분한다. 이름 줄과 추천 근거 줄에 같이 붙여 한 덩어리로 보이게 한다. */
const ACCENT_CLASS = 'shadow-[inset_3px_0_0_var(--color-primary)]'

/**
 * 대응안 하나의 근거는 그 행 바로 아래 한 곳에 모은다. 대응안별 설명이 있으면 설명을 보여 주고,
 * 설명이 같은 말을 되풀이하는 사유 라벨(배지 아래)은 숨긴다. 설명 생성이 실패하면 사유 라벨이 대신 나온다.
 * 추천 대응안은 설명 뒤에 순위 기준(추천 근거)이 이어진다.
 * 불가·확인 필요인 대응안도 숨기지 않으며, 판정할 수 없는 값은 '—'로 표시한다.
 */
export function OptionTable({ options, recommendation }: OptionTableProps) {
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
            const evidence = getEvidence(option, recommendation)

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
                    <div className="flex flex-col items-start gap-4pxr">
                      <Badge variant={FEASIBILITY_BADGE_VARIANT[option.feasibility]} dot={false}>
                        {FEASIBILITY_LABEL[option.feasibility]}
                      </Badge>
                      {option.reasonCode && !option.explanation && (
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
                    {option.remainingRiskOrders === null
                      ? EMPTY
                      : `${option.remainingRiskOrders}건`}
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
  explanation: string | null
  /** 추천 대응안에만 있다 */
  recommendation: string | null
}

/** 행 아래에 보여 줄 근거. 설명도 추천 근거도 없으면 줄을 만들지 않는다. */
const getEvidence = (option: DelayOption, recommendation: string | null): OptionEvidence | null => {
  const evidence = {
    explanation: option.explanation,
    recommendation: option.recommended ? recommendation : null,
  }
  return evidence.explanation || evidence.recommendation ? evidence : null
}

/** 설명 검증을 통과한 실행에서 1순위로 뽑힌 실행 가능한 대응안에 붙인다. */
function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-4pxr rounded-full bg-primary-100 px-8pxr py-2pxr text-caption font-bold text-primary">
      <Sparkles className="size-12pxr" aria-hidden="true" />
      AI 추천
    </span>
  )
}
