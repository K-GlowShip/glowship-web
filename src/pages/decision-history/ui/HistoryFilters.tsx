import { Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { DateRangeInput } from '@/shared/ui/date-range-input'
import { Dropdown, type DropdownOption } from '@/shared/ui/dropdown'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import type { DecisionStatus } from '@/shared/api'

import { HISTORY_STATUS_LABEL, HISTORY_STATUS_OPTIONS, type HistoryFilter } from '../model/history'

const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: '전체 상태' },
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(draft)
  }

  return (
    <form
      role="search"
      className="grid items-end gap-16pxr md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_auto]"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-8pxr">
        <Label id="history-period-label">조회 기간</Label>
        <DateRangeInput
          role="group"
          aria-labelledby="history-period-label"
          value={{ start: draft.startDate, end: draft.endDate }}
          onChange={({ start, end }) => setDraft({ ...draft, startDate: start, endDate: end })}
        />
      </div>

      <div className="flex flex-col gap-8pxr">
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
            value={draft.keyword}
            onChange={(event) => setDraft({ ...draft, keyword: event.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8pxr">
        <Label id="history-status-label">상태</Label>
        <Dropdown
          aria-labelledby="history-status-label"
          options={STATUS_OPTIONS}
          value={draft.status}
          onChange={(status) => setDraft({ ...draft, status: status as DecisionStatus | '' })}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        loading={isSearching}
        className="h-44pxr md:col-span-2 xl:col-span-1"
      >
        조회
      </Button>
    </form>
  )
}
