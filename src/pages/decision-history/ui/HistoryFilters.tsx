import { Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { DateRangeInput } from '@/shared/ui/date-range-input'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'

import {
  HISTORY_STATUS_LABEL,
  HISTORY_STATUS_OPTIONS,
  type HistoryFilter,
  type HistoryStatus,
} from '../model/history'

interface HistoryFiltersProps {
  value: HistoryFilter
  selectors: string[]
  onSearch: (filter: HistoryFilter) => void
}

export function HistoryFilters({ value, selectors, onSearch }: HistoryFiltersProps) {
  const [draft, setDraft] = useState(value)

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
        <Label htmlFor="history-period">조회 기간</Label>
        <DateRangeInput
          id="history-period"
          value={{ start: draft.startDate, end: draft.endDate }}
          onChange={({ start, end }) => setDraft({ ...draft, startDate: start, endDate: end })}
        />
      </div>

      <div className="flex flex-col gap-8pxr">
        <Label htmlFor="history-keyword">선적 / 상품</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="history-keyword"
            className="pl-40pxr"
            placeholder="선적 번호 또는 상품 검색"
            value={draft.keyword}
            onChange={(event) => setDraft({ ...draft, keyword: event.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8pxr">
        <Label htmlFor="history-status">상태</Label>
        <Select
          id="history-status"
          value={draft.status}
          onChange={(event) =>
            setDraft({ ...draft, status: event.target.value as HistoryStatus | '' })
          }
        >
          <option value="">전체 상태</option>
          {HISTORY_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {HISTORY_STATUS_LABEL[status]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-8pxr">
        <Label htmlFor="history-selector">선택자</Label>
        <Select
          id="history-selector"
          value={draft.selector}
          onChange={(event) => setDraft({ ...draft, selector: event.target.value })}
        >
          <option value="">전체 팀원</option>
          {selectors.map((selector) => (
            <option key={selector} value={selector}>
              {selector}
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" size="lg" className="h-44pxr md:col-span-2 xl:col-span-1">
        조회
      </Button>
    </form>
  )
}
