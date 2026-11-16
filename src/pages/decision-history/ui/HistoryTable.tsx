import { ChevronRight } from 'lucide-react'

import { getRoleLabel } from '@/entities/session'
import type { Decision } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  type ListQuery,
  TableQueryRows,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { HISTORY_STATUS_BADGE_VARIANT, HISTORY_STATUS_LABEL } from '../model/history'
import { getDecisionOptionLabel } from '../model/history-display'

interface HistoryTableProps {
  query: ListQuery<Decision>
  selectedId: string | null
  onSelect: (decision: Decision) => void
}

const HEAD_CLASS_NAME = 'px-16pxr'
const CELL_CLASS_NAME = 'px-16pxr py-20pxr align-top'

/**
 * 판단 이력 목록. 한 줄이 한 번의 판단이다. 어떤 상품에서 무엇을 골랐는지가 먼저 읽히도록
 * 상품명과 대응안을 굵게 두고, 선적 코드·실행 ID 같은 식별자는 작고 옅게 아래에 붙인다.
 */
export function HistoryTable({ query, selectedId, onSelect }: HistoryTableProps) {
  return (
    <Table className="min-w-880pxr">
      <TableHeader>
        <TableRow>
          <TableHead className={cn(HEAD_CLASS_NAME, 'w-140pxr')}>선택 일시</TableHead>
          <TableHead className={HEAD_CLASS_NAME}>상품</TableHead>
          <TableHead className={cn(HEAD_CLASS_NAME, 'w-220pxr')}>선택한 대응안</TableHead>
          <TableHead className={cn(HEAD_CLASS_NAME, 'w-180pxr')}>선택자</TableHead>
          <TableHead className={cn(HEAD_CLASS_NAME, 'w-140pxr')}>상태</TableHead>
          <TableHead className="w-40pxr">
            <span className="sr-only">상세 보기</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableQueryRows query={query} colSpan={6} emptyMessage="조건에 맞는 이력이 없습니다.">
          {(decisions) =>
            decisions.map((decision) => {
              const optionLabel = getDecisionOptionLabel(decision)
              const decidedAt = formatYYYYMMDDHHmm(decision.decidedAt)
              const [decidedDate, decidedTime] = decidedAt.split(' ')

              return (
                <TableRow
                  key={decision.decisionId}
                  className={cn(
                    'group cursor-pointer hover:bg-background',
                    decision.decisionId === selectedId && 'bg-muted',
                  )}
                  onClick={() => onSelect(decision)}
                >
                  <TableCell className={CELL_CLASS_NAME}>
                    <button
                      type="button"
                      className="cursor-pointer text-left outline-none focus-visible:underline"
                      aria-label={`${decidedAt} 상세 보기`}
                    >
                      <span className="block tabular-nums">{decidedDate}</span>
                      <span className="block text-caption text-muted-foreground tabular-nums">
                        {decidedTime}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className={cn(CELL_CLASS_NAME, 'wrap-break-word')}>
                    <p className="font-medium">
                      {decision.representativeSku?.productName ?? EMPTY_VALUE}
                    </p>
                    <p className="mt-2pxr text-caption text-muted-foreground">
                      {decision.shipment.shipmentCode} · {decision.run.runCode ?? EMPTY_VALUE}
                    </p>
                  </TableCell>
                  <TableCell
                    className={cn(
                      CELL_CLASS_NAME,
                      decision.responseOption ? 'font-medium' : 'text-muted-foreground',
                    )}
                  >
                    {optionLabel}
                  </TableCell>
                  <TableCell className={cn(CELL_CLASS_NAME, 'wrap-break-word')}>
                    <p>{decision.decidedBy.displayName}</p>
                    <p className="mt-2pxr text-caption text-muted-foreground">
                      {getRoleLabel(decision.decidedBy.roleCode)}
                    </p>
                  </TableCell>
                  <TableCell className={CELL_CLASS_NAME}>
                    <Badge variant={HISTORY_STATUS_BADGE_VARIANT[decision.status]}>
                      {HISTORY_STATUS_LABEL[decision.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(CELL_CLASS_NAME, 'px-0')}>
                    <ChevronRight
                      className="size-18pxr text-input transition-colors group-hover:text-primary group-has-[button:focus-visible]:text-primary"
                      aria-hidden="true"
                    />
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableQueryRows>
      </TableBody>
    </Table>
  )
}
