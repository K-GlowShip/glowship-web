import type { Decision } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
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

import {
  formatSelectedAt,
  HISTORY_STATUS_BADGE_VARIANT,
  HISTORY_STATUS_LABEL,
} from '../model/history'
import { getDecisionOptionLabel, getDecisionTargetLabel } from '../model/history-display'

interface HistoryTableProps {
  query: ListQuery<Decision>
  selectedId: string | null
  onSelect: (decision: Decision) => void
}

export function HistoryTable({ query, selectedId, onSelect }: HistoryTableProps) {
  return (
    <Table className="min-w-1000pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="w-180pxr">선택 일시</TableHead>
          <TableHead>선적 / 상품</TableHead>
          <TableHead>선택한 대응안</TableHead>
          <TableHead className="w-200pxr">선택자</TableHead>
          <TableHead className="w-160pxr">실행 ID</TableHead>
          <TableHead className="w-140pxr">상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableQueryRows query={query} colSpan={6} emptyMessage="조건에 맞는 이력이 없습니다.">
          {(decisions) =>
            decisions.map((decision) => (
              <TableRow
                key={decision.decisionId}
                className={cn(
                  'cursor-pointer hover:bg-background',
                  decision.decisionId === selectedId && 'bg-muted',
                )}
                onClick={() => onSelect(decision)}
              >
                <TableCell>
                  <button
                    type="button"
                    className="cursor-pointer outline-none focus-visible:underline"
                    aria-label={`${formatSelectedAt(decision.decidedAt)} 상세 보기`}
                  >
                    {formatSelectedAt(decision.decidedAt)}
                  </button>
                </TableCell>
                <TableCell className="wrap-break-word">
                  {getDecisionTargetLabel(decision)}
                </TableCell>
                <TableCell className="truncate" title={getDecisionOptionLabel(decision)}>
                  {getDecisionOptionLabel(decision)}
                </TableCell>
                <TableCell className="wrap-break-word">{decision.decidedBy.displayName}</TableCell>
                <TableCell>{decision.run.runCode ?? EMPTY_VALUE}</TableCell>
                <TableCell>
                  <Badge variant={HISTORY_STATUS_BADGE_VARIANT[decision.status]}>
                    {HISTORY_STATUS_LABEL[decision.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          }
        </TableQueryRows>
      </TableBody>
    </Table>
  )
}
