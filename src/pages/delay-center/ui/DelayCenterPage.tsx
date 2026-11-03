import { useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  countByStatus,
  DELAY_STATUS_OPTIONS,
  type DelayStatusFilter,
  filterDelayCases,
  sortDelayCases,
} from '../model/delay-center'
import { CURRENT_ROLE, DELAY_CASES } from '../model/delay-center-mock'
import { DelayDetail } from './DelayDetail'
import { DelayList } from './DelayList'

const CASE_PARAM = 'id'
const SORTED_CASES = sortDelayCases(DELAY_CASES)
const COUNTS = countByStatus(SORTED_CASES)

const isStatusFilter = (value: string): value is DelayStatusFilter =>
  value === 'all' || (DELAY_STATUS_OPTIONS as string[]).includes(value)

export function DelayCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<DelayStatusFilter>('all')

  const visibleCases = filterDelayCases(SORTED_CASES, status, keyword)
  // URL의 id가 없거나 목록에 없으면 첫 번째 항목을 보여 준다. 상세가 비어 있는 상태를 만들지 않기 위해서다.
  const selected =
    visibleCases.find((delayCase) => delayCase.id === searchParams.get(CASE_PARAM)) ??
    visibleCases[0] ??
    null

  const handleSelect = (id: string) => {
    setSearchParams({ [CASE_PARAM]: id }, { replace: true })
  }

  const handleStatusChange = (next: DelayStatusFilter) => {
    if (isStatusFilter(next)) {
      setStatus(next)
    }
  }

  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">지연 대응 센터</h1>
        <p className="text-b1 text-muted-foreground">
          지연 영향을 확인하고, 근거를 비교해 최선의 대응안을 선택하세요.
        </p>
      </header>

      <div className="flex flex-col gap-24pxr lg:flex-row lg:items-start">
        <DelayList
          cases={visibleCases}
          counts={COUNTS}
          selectedId={selected?.id ?? null}
          keyword={keyword}
          status={status}
          onKeywordChange={setKeyword}
          onStatusChange={handleStatusChange}
          onSelect={handleSelect}
        />

        {selected ? (
          <DelayDetail key={selected.id} delayCase={selected} role={CURRENT_ROLE} />
        ) : (
          <p className="rounded-panel border border-border bg-card px-32pxr py-80pxr text-center text-b1 text-muted-foreground lg:flex-1">
            표시할 지연 항목이 없습니다.
          </p>
        )}
      </div>
    </div>
  )
}
