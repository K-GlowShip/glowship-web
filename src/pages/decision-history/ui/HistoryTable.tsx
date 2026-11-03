import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

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
    <Table className="min-w-900pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="w-180pxr">선택 일시</TableHead>
          <TableHead>선적 / 상품</TableHead>
          <TableHead>선택한 대응안</TableHead>
          <TableHead className="w-120pxr">선택자</TableHead>
          <TableHead className="w-160pxr">실행 ID</TableHead>
          <TableHead className="w-140pxr">상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 && (
          <TableEmptyRow colSpan={6}>조건에 맞는 이력이 없습니다.</TableEmptyRow>
        )}
        {records.map((record) => (
          <TableRow
            key={record.id}
            className={cn(
              'cursor-pointer hover:bg-background',
              record.id === selectedId && 'bg-muted',
            )}
            onClick={() => onSelect(record)}
          >
            <TableCell>
              <button
                type="button"
                className="cursor-pointer outline-none focus-visible:underline"
                aria-label={`${formatSelectedAt(record.selectedAt)} 상세 보기`}
              >
                {formatSelectedAt(record.selectedAt)}
              </button>
            </TableCell>
            <TableCell className="wrap-break-word">
              {record.shipmentCode} / {record.productName}
            </TableCell>
            <TableCell className="truncate" title={record.option}>
              {record.option}
            </TableCell>
            <TableCell>{record.selector}</TableCell>
            <TableCell>{record.runCode}</TableCell>
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
