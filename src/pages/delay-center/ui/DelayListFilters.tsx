import { Search } from 'lucide-react'
import { type SubmitEvent, useState } from 'react'

import { DELAY_COUNT_KEY } from '@/entities/delay-event'
import { formatNumber } from '@/shared/lib/format-number'
import type { DelayEventCounts } from '@/shared/api'
import { DELAY_SEARCH_MAX_LENGTH } from '@/shared/config'
import { Button } from '@/shared/ui/button'
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
  /** 불러오기 전이거나 불러오지 못했으면 undefined. 건수 없이 상태 이름만 보여 준다 */
  counts: DelayEventCounts | undefined
  /** 조회 버튼을 누르거나 Enter를 칠 때만 부른다. 검색어와 상태를 고르는 동안에는 부르지 않는다. */
  onSearch: (filters: { keyword: string; status: DelayStatusFilter }) => void
}

/**
 * 지연 목록 위의 상태 필터와 검색창을 가로 한 줄로 둔다(상태 필터가 앞). 검색창은 넓은 화면에서도 320px로 고정한다.
 * 검색어와 상태는 고르는 동안 이 안에만 담아 두고, 조회 버튼(또는 Enter)을 눌렀을 때 한꺼번에 적용한다.
 * 글자를 치거나 상태를 고를 때마다 서버에 요청하지 않게 하기 위해서다. 상태 옆에 건수를 함께 보여 준다.
 */
export function DelayListFilters({ keyword, status, counts, onSearch }: DelayListFiltersProps) {
  const [draftKeyword, setDraftKeyword] = useState(keyword)
  const [draftStatus, setDraftStatus] = useState(status)
  const [synced, setSynced] = useState({ keyword, status })

  // 뒤로 가기 등으로 주소의 검색 조건이 바뀌면 입력 칸도 맞춘다
  if (keyword !== synced.keyword || status !== synced.status) {
    setSynced({ keyword, status })
    setDraftKeyword(keyword)
    setDraftStatus(status)
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch({ keyword: draftKeyword.trim(), status: draftStatus })
  }

  const withCount = (label: string, count: number | undefined) =>
    count === undefined ? label : `${label} (${formatNumber(count)})`

  const statusOptions: DropdownOption[] = [
    { value: STATUS_FILTER_ALL, label: withCount('전체', counts?.all) },
    ...DELAY_STATUS_OPTIONS.map((value) => ({
      value,
      label: withCount(DELAY_STATUS_LABEL[value], counts?.[DELAY_COUNT_KEY[value]]),
    })),
  ]

  return (
    <form
      role="search"
      className="flex flex-col gap-8pxr md:flex-row md:items-center"
      onSubmit={handleSubmit}
    >
      <Dropdown
        className="md:w-220pxr md:shrink-0"
        aria-label="상태 필터"
        options={statusOptions}
        value={draftStatus}
        onChange={(value) => setDraftStatus(value as DelayStatusFilter)}
      />
      <div className="relative min-w-0 md:w-320pxr">
        <Search
          className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="선적 번호 또는 상품 검색"
          className="pl-40pxr"
          placeholder="선적 번호 / 상품"
          maxLength={DELAY_SEARCH_MAX_LENGTH}
          value={draftKeyword}
          onChange={(event) => setDraftKeyword(event.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="h-44pxr">
        조회
      </Button>
    </form>
  )
}
