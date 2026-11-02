import { useState } from 'react'

import { Card, CardContent } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'

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
  // 닫힘 애니메이션 동안 내용이 사라지지 않도록 선택한 이력과 열림 상태를 따로 둔다
  const [selected, setSelected] = useState<HistoryRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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

  const handleSelect = (record: HistoryRecord) => {
    setSelected(record)
    setIsDrawerOpen(true)
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
          <p className="text-b2 text-muted-foreground">총 {filtered.length}건</p>
          <div className="overflow-x-auto">
            <HistoryTable
              records={pageRecords}
              selectedId={isDrawerOpen ? (selected?.id ?? null) : null}
              onSelect={handleSelect}
            />
          </div>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        </CardContent>
      </Card>

      <HistoryDetailDrawer record={selected} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </div>
  )
}
