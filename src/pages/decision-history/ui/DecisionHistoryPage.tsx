import { useState } from 'react'

import { useDetailDialog } from '@/shared/lib/use-detail-dialog'
import { Card, CardContent } from '@/shared/ui/card'
import { TableTemplate } from '@/shared/ui/table-template'

import {
  DEFAULT_HISTORY_FILTER,
  filterHistory,
  HISTORY_PAGE_SIZE,
  type HistoryFilter,
  type HistoryRecord,
} from '../model/history'
import { HISTORY_RECORDS } from '../model/history-mock'
import { HistoryDetailDrawer } from './HistoryDetailDrawer'
import { HistoryFilters } from './HistoryFilters'
import { HistoryTable } from './HistoryTable'

const SELECTORS = [...new Set(HISTORY_RECORDS.map((record) => record.selector))]

export function DecisionHistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>(DEFAULT_HISTORY_FILTER)
  const [page, setPage] = useState(1)
  const detail = useDetailDialog<HistoryRecord>()

  const filtered = filterHistory(HISTORY_RECORDS, filter)
  const pageCount = Math.max(1, Math.ceil(filtered.length / HISTORY_PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRecords = filtered.slice(
    (currentPage - 1) * HISTORY_PAGE_SIZE,
    currentPage * HISTORY_PAGE_SIZE,
  )

  const handleSearch = (next: HistoryFilter) => {
    setFilter(next)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">의사결정 이력</h1>
        <p className="text-b1 text-muted-foreground">선택한 대응안과 실행 상태를 조회해보세요</p>
      </header>

      <Card className="rounded-panel">
        <CardContent className="flex flex-col gap-16pxr p-32pxr">
          <HistoryFilters value={filter} selectors={SELECTORS} onSearch={handleSearch} />
          <TableTemplate
            totalCount={filtered.length}
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          >
            <HistoryTable
              records={pageRecords}
              selectedId={detail.open ? (detail.selected?.id ?? null) : null}
              onSelect={detail.show}
            />
          </TableTemplate>
        </CardContent>
      </Card>

      <HistoryDetailDrawer
        record={detail.selected}
        open={detail.open}
        onOpenChange={detail.onOpenChange}
        onCloseAutoFocus={detail.onCloseAutoFocus}
      />
    </div>
  )
}
