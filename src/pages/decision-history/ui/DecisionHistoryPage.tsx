import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { type Decision, decisionQueries } from '@/shared/api'
import { parsePageParam } from '@/shared/lib/page-param'
import { useDetailDialog } from '@/shared/lib/use-detail-dialog'
import { Card, CardContent } from '@/shared/ui/card'
import { TableTemplate } from '@/shared/ui/table-template'

import {
  HISTORY_PARAM,
  type HistoryFilter,
  isSameHistoryFilter,
  parseHistoryFilter,
  toDecisionParams,
  toHistoryParams,
} from '../model/history'
import { HistoryDetailDrawer } from './HistoryDetailDrawer'
import { HistoryFilters } from './HistoryFilters'
import { HistoryTable } from './HistoryTable'

/** 의사결정 이력 화면. 조회 조건(기간·검색어·상태)과 페이지는 주소에 담아 새로고침·뒤로 가기에서도 유지한다. */
export function DecisionHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // 기간·검색어·상태를 고르지 않은 상태가 기본이다. 기간이 비어 있으면 전체 기간을 조회한다.
  const filter = parseHistoryFilter(searchParams)
  const page = parsePageParam(searchParams.get(HISTORY_PARAM.PAGE))
  const detail = useDetailDialog<Decision>()
  const query = useQuery(decisionQueries.list(toDecisionParams(filter, page)))
  const { data, isFetching } = query

  const updateParams = (nextFilter: HistoryFilter, nextPage: number) =>
    setSearchParams(toHistoryParams(nextFilter, nextPage), { replace: true })

  // 조건이 그대로(같은 필터, 1페이지)면 주소가 바뀌지 않아 요청이 나가지 않으므로, "조회"를 누르면 새로 받는다
  const handleSearch = (next: HistoryFilter) => {
    if (isSameHistoryFilter(next, filter) && page === 1) {
      void query.refetch()
      return
    }
    updateParams(next, 1)
  }

  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">의사결정 이력</h1>
        <p className="text-b1 text-muted-foreground">선택한 대응안과 실행 상태를 조회해보세요</p>
      </header>

      <Card className="rounded-panel">
        <CardContent className="flex flex-col gap-16pxr px-24pxr pt-12pxr pb-24pxr">
          <HistoryFilters value={filter} isSearching={isFetching} onSearch={handleSearch} />

          <TableTemplate
            totalCount={data?.totalCount}
            page={page}
            pageCount={data ? Math.max(1, data.totalPages) : undefined}
            onPageChange={(next) => updateParams(filter, next)}
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
