import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import {
  formatSelectedAt,
  HISTORY_STATUS_LABEL,
  type HistoryRecord,
  type HistoryStatus,
} from '../model/history'

const STATUS_BADGE_VARIANT = {
  final: 'success',
  draft: 'neutral',
  reanalysis: 'warning',
} as const satisfies Record<HistoryStatus, 'success' | 'neutral' | 'warning'>

interface HistoryTableProps {
  records: HistoryRecord[]
  selectedId: string | null
  onSelect: (record: HistoryRecord) => void
}

export function HistoryTable({ records, selectedId, onSelect }: HistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>선택 일시</TableHead>
          <TableHead>선적 / 상품</TableHead>
          <TableHead>선택한 대응안</TableHead>
          <TableHead>선택자</TableHead>
          <TableHead>실행 ID</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-48pxr text-center text-muted-foreground">
              조건에 맞는 이력이 없습니다.
            </TableCell>
          </TableRow>
        )}
        {records.map((record) => (
          <TableRow
            key={record.id}
            className={cn(
              'cursor-pointer hover:bg-primary-50',
              record.id === selectedId && 'bg-muted',
            )}
            onClick={() => onSelect(record)}
          >
            <TableCell>
              <button
                type="button"
                className="cursor-pointer font-bold text-primary outline-none hover:underline focus-visible:underline"
                aria-label={`${formatSelectedAt(record.selectedAt)} 상세 보기`}
              >
                {formatSelectedAt(record.selectedAt)}
              </button>
            </TableCell>
            <TableCell>
              {record.shipmentCode} / {record.productName}
            </TableCell>
            <TableCell>{record.option}</TableCell>
            <TableCell>{record.selector}</TableCell>
            <TableCell>{record.executionId ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={STATUS_BADGE_VARIANT[record.status]}>
                {HISTORY_STATUS_LABEL[record.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
