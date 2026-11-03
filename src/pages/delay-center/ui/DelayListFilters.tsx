import { Search } from 'lucide-react'

import { Dropdown, type DropdownOption } from '@/shared/ui/dropdown'
import { Input } from '@/shared/ui/input'

import {
  DELAY_STATUS_LABEL,
  DELAY_STATUS_OPTIONS,
  type DelayStatusFilter,
  STATUS_FILTER_ALL,
} from '../model/delay-center'

interface DelayListFiltersProps {
  keyword: string
  status: DelayStatusFilter
  counts: Record<DelayStatusFilter, number>
  onKeywordChange: (keyword: string) => void
  onStatusChange: (status: DelayStatusFilter) => void
}

/** 지연 목록 위의 검색창과 상태 필터. 상태 옆에 건수를 함께 보여 준다. */
export function DelayListFilters({
  keyword,
  status,
  counts,
  onKeywordChange,
  onStatusChange,
}: DelayListFiltersProps) {
  const statusOptions: DropdownOption[] = [
    { value: STATUS_FILTER_ALL, label: `전체 (${counts[STATUS_FILTER_ALL]})` },
    ...DELAY_STATUS_OPTIONS.map((value) => ({
      value,
      label: `${DELAY_STATUS_LABEL[value]} (${counts[value]})`,
    })),
  ]

  return (
    <div className="flex flex-col gap-8pxr rounded-card border border-border bg-card p-16pxr">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="선적 번호 또는 상품 검색"
          className="pl-40pxr"
          placeholder="선적 번호 / 상품"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
      </div>
      <Dropdown
        aria-label="상태 필터"
        options={statusOptions}
        value={status}
        onChange={(value) => onStatusChange(value as DelayStatusFilter)}
      />
    </div>
  )
}
