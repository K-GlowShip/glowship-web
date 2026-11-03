import { Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { DateRangeInput } from '@/shared/ui/date-range-input'
import { Dropdown, type DropdownOption } from '@/shared/ui/dropdown'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import {
  HISTORY_STATUS_LABEL,
  HISTORY_STATUS_OPTIONS,
  type HistoryFilter,
  type HistoryStatus,
} from '../model/history'

const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: '전체 상태' },
  ...HISTORY_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: HISTORY_STATUS_LABEL[status],
  })),
]

interface HistoryFiltersProps {
  value: HistoryFilter
  selectors: string[]
  onSearch: (filter: HistoryFilter) => void
}

export function HistoryFilters({ value, selectors, onSearch }: HistoryFiltersProps) {
  const [draft, setDraft] = useState(value)
  const selectorOptions: DropdownOption[] = [
    { value: '', label: '전체 팀원' },
    ...selectors.map((selector) => ({ value: selector, label: selector })),
  ]

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(draft)
  }

  return (
    <form
      role="search"
      className="grid items-end gap-16pxr md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
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
        <Label id="history-selector-label">선택자</Label>
        <Dropdown
          aria-labelledby="history-selector-label"
          options={selectorOptions}
          value={draft.selector}
          onChange={(selector) => setDraft({ ...draft, selector })}
        />
      </div>

      <div className="flex flex-col gap-8pxr">
        <Label id="history-status-label">상태</Label>
        <Dropdown
          aria-labelledby="history-status-label"
          options={STATUS_OPTIONS}
          value={draft.status}
          onChange={(status) => setDraft({ ...draft, status: status as HistoryStatus | '' })}
        />
      </div>

      <Button type="submit" size="lg" className="h-44pxr md:col-span-2 xl:col-span-1">
        조회
      </Button>
    </form>
  )
}
