import { Search } from 'lucide-react'
import { type SubmitEvent, useState } from 'react'

import { DELAY_COUNT_KEY } from '@/entities/delay-event'
import type { DelayEventCounts } from '@/shared/api'
import { DELAY_SEARCH_MAX_LENGTH } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

import {
  DELAY_STATUS_LABEL,
  DELAY_STATUS_OPTIONS,
  type DelayStatusFilter,
  STATUS_FILTER_ALL,
} from '../model/delay-center'

interface DelayStatusTabsProps {
  status: DelayStatusFilter
  /** 불러오기 전이거나 불러오지 못했으면 undefined. 건수 없이 상태 이름만 보여 준다 */
  counts: DelayEventCounts | undefined
  onChange: (status: DelayStatusFilter) => void
}

/**
 * 지연 목록의 상태 탭(명세 4.4 탭 표). 상태마다 건수를 함께 보여 줘서 어디에 일이 쌓였는지 목록을 열기 전에 안다.
 * 누르면 바로 그 상태만 조회한다. 건수는 검색어 등 다른 조건을 반영한 값이다.
 */
export function DelayStatusTabs({ status, counts, onChange }: DelayStatusTabsProps) {
  const tabs: { value: DelayStatusFilter; label: string; count: number | undefined }[] = [
    { value: STATUS_FILTER_ALL, label: '전체', count: counts?.all },
    ...DELAY_STATUS_OPTIONS.map((value) => ({
      value,
      label: DELAY_STATUS_LABEL[value],
      count: counts?.[DELAY_COUNT_KEY[value]],
    })),
  ]

  return (
    <div
      role="group"
      aria-label="상태 필터"
      className="flex gap-4pxr overflow-x-auto border-b border-border"
    >
      {tabs.map((tab) => {
        const isSelected = tab.value === status

        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex shrink-0 cursor-pointer items-baseline gap-6pxr px-12pxr py-10pxr text-b1 whitespace-nowrap outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 focus-visible:ring-inset',
              isSelected
                ? 'font-bold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-2pxr after:bg-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-caption tabular-nums',
                  !isSelected && tab.count === 0 && 'opacity-50',
                )}
              >
                {formatNumber(tab.count)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface DelaySearchProps {
  keyword: string
  /** 조회 버튼을 누르거나 Enter를 칠 때만 부른다. 글자를 치는 동안에는 부르지 않는다. */
  onSearch: (keyword: string) => void
}

/** 선적 번호·상품 검색. 글자를 칠 때마다 서버에 요청하지 않게, 조회 버튼(또는 Enter)을 눌렀을 때 적용한다. */
export function DelaySearch({ keyword, onSearch }: DelaySearchProps) {
  const [draft, setDraft] = useState(keyword)
  const [synced, setSynced] = useState(keyword)

  // 뒤로 가기 등으로 주소의 검색어가 바뀌면 입력 칸도 맞춘다
  if (keyword !== synced) {
    setSynced(keyword)
    setDraft(keyword)
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(draft.trim())
  }

  return (
    <form role="search" className="flex min-w-0 items-center gap-8pxr" onSubmit={handleSubmit}>
      <div className="relative min-w-0 flex-1 md:w-320pxr md:flex-none">
        <Search
          className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="선적 번호 또는 상품 검색"
          className="pl-40pxr"
          placeholder="선적 번호 / 상품"
          maxLength={DELAY_SEARCH_MAX_LENGTH}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>
      <Button type="submit" variant="secondary" size="lg" className="h-44pxr shrink-0">
        조회
      </Button>
    </form>
  )
}
