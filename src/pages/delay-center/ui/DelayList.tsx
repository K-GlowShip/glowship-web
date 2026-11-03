import type { DelayCase, DelayStatusFilter } from '../model/delay-center'
import { DelayCard } from './DelayCard'
import { DelayListFilters } from './DelayListFilters'

interface DelayListProps {
  cases: DelayCase[]
  counts: Record<DelayStatusFilter, number>
  selectedId: string | null
  keyword: string
  status: DelayStatusFilter
  onKeywordChange: (keyword: string) => void
  onStatusChange: (status: DelayStatusFilter) => void
  onSelect: (id: string) => void
}

export function DelayList({
  cases,
  counts,
  selectedId,
  keyword,
  status,
  onKeywordChange,
  onStatusChange,
  onSelect,
}: DelayListProps) {
  return (
    <section aria-label="지연 목록" className="flex flex-col gap-12pxr lg:w-320pxr lg:shrink-0">
      <DelayListFilters
        keyword={keyword}
        status={status}
        counts={counts}
        onKeywordChange={onKeywordChange}
        onStatusChange={onStatusChange}
      />

      <ul className="flex flex-col gap-8pxr">
        {cases.length === 0 && (
          <li className="py-32pxr text-center text-b1 text-muted-foreground">
            조건에 맞는 지연이 없습니다.
          </li>
        )}
        {cases.map((delayCase) => (
          <li key={delayCase.id}>
            <DelayCard
              delayCase={delayCase}
              selected={delayCase.id === selectedId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
