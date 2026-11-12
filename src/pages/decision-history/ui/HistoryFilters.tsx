import { Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { SEARCH_MAX_LENGTH } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { DateRangeInput } from '@/shared/ui/date-range-input'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FilterTabs, type FilterTabOption } from '@/shared/ui/tabs'

import type { DecisionStatus } from '@/shared/api'

import {
  HISTORY_STATUS_LABEL,
  HISTORY_STATUS_OPTIONS,
  type HistoryFilter,
  isSameHistoryFilter,
} from '../model/history'

/** '전체' 탭의 값. 탭 값은 빈 문자열일 수 없어 필터의 빈 값('')과 따로 둔다 */
const STATUS_TAB_ALL = 'ALL'

const STATUS_TABS: FilterTabOption<string>[] = [
  { value: STATUS_TAB_ALL, label: '전체' },
  ...HISTORY_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: HISTORY_STATUS_LABEL[status],
  })),
]

interface HistoryFiltersProps {
  value: HistoryFilter
  /** 조회 요청을 기다리는 중이면 "조회" 버튼을 막는다 */
  isSearching: boolean
  onSearch: (filter: HistoryFilter) => void
}

export function HistoryFilters({ value, isSearching, onSearch }: HistoryFiltersProps) {
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)

  // 뒤로 가기 등으로 적용된 조건이 바뀌면 입력 칸도 그 값으로 맞춘다
  if (!isSameHistoryFilter(value, synced)) {
    setSynced(value)
    setDraft(value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(draft)
  }

  // 상태는 누르는 즉시 적용한다. 입력해 둔 기간·검색어도 함께 적용해 입력이 사라지지 않게 한다
  const handleStatusChange = (status: DecisionStatus | '') => {
    const next = { ...draft, status }
    setDraft(next)
    onSearch(next)
  }

  return (
    <div className="flex flex-col gap-24pxr">
      <FilterTabs
        aria-label="상태 필터"
        options={STATUS_TABS}
        value={value.status || STATUS_TAB_ALL}
        onValueChange={(next) =>
          handleStatusChange(next === STATUS_TAB_ALL ? '' : (next as DecisionStatus))
        }
      />

      <form role="search" className="flex flex-wrap items-end gap-16pxr" onSubmit={handleSubmit}>
        <div className="flex w-full max-w-360pxr flex-col gap-8pxr">
          <Label id="history-period-label">조회 기간</Label>
          <DateRangeInput
            role="group"
            aria-labelledby="history-period-label"
            value={{ start: draft.startDate, end: draft.endDate }}
            onChange={({ start, end }) => setDraft({ ...draft, startDate: start, endDate: end })}
          />
        </div>

        <div className="flex w-full max-w-320pxr flex-col gap-8pxr">
          <Label id="history-keyword-label">선적 / 상품</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-labelledby="history-keyword-label"
              className="pl-40pxr"
              placeholder="선적 번호 또는 상품 검색"
              maxLength={SEARCH_MAX_LENGTH}
              value={draft.keyword}
              onChange={(event) => setDraft({ ...draft, keyword: event.target.value })}
            />
          </div>
        </div>

        <Button type="submit" size="lg" loading={isSearching} className="h-44pxr">
          조회
        </Button>
      </form>
    </div>
  )
}
