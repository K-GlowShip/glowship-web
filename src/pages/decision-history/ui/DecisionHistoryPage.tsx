import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { type Decision, decisionQueries } from '@/shared/api'
import { useDetailDialog } from '@/shared/lib/use-detail-dialog'
import { Card, CardContent } from '@/shared/ui/card'
import { TableTemplate } from '@/shared/ui/table-template'

import { type HistoryFilter, toDecisionParams } from '../model/history'
import { HistoryDetailDrawer } from './HistoryDetailDrawer'
import { HistoryFilters } from './HistoryFilters'
import { HistoryTable } from './HistoryTable'

export function DecisionHistoryPage() {
  // 기간·검색어·상태를 고르지 않은 상태로 시작한다. 기간이 비어 있으면 전체 기간을 조회한다.
  const [filter, setFilter] = useState<HistoryFilter>({
    startDate: '',
    endDate: '',
    keyword: '',
    status: '',
  })
  const [page, setPage] = useState(1)
  const detail = useDetailDialog<Decision>()
  const query = useQuery(decisionQueries.list(toDecisionParams(filter, page)))
  const { data, isFetching } = query

  // 조건이 그대로(같은 필터, 1페이지)면 상태가 바뀌지 않아 요청이 나가지 않으므로, "조회"를 누르면 새로 받는다
  const handleSearch = (next: HistoryFilter) => {
    if (JSON.stringify(next) === JSON.stringify(filter) && page === 1) {
      void query.refetch()
      return
    }
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
          <HistoryFilters value={filter} isSearching={isFetching} onSearch={handleSearch} />
          <TableTemplate
            totalCount={data?.totalCount}
            page={page}
            pageCount={data ? Math.max(1, data.totalPages) : undefined}
            onPageChange={setPage}
          >
            <HistoryTable
              query={query}
              selectedId={detail.open ? (detail.selected?.decisionId ?? null) : null}
              onSelect={detail.show}
            />
          </TableTemplate>
        </CardContent>
      </Card>

      <HistoryDetailDrawer
        decision={detail.selected}
        open={detail.open}
        onOpenChange={detail.onOpenChange}
        onCloseAutoFocus={detail.onCloseAutoFocus}
      />
    </div>
  )
}
