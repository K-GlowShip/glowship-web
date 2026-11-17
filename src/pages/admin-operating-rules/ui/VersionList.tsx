import type { OperatingRuleSet } from '@/shared/api'
import { cn } from '@/shared/lib/cn'

interface VersionListProps {
  ruleSets: OperatingRuleSet[]
  selectedId: string
  onSelect: (operatingRuleSetId: string) => void
}

/** 버전 이력. 버전을 누르면 오른쪽에 그 버전의 기준이 보인다 */
export function VersionList({ ruleSets, selectedId, onSelect }: VersionListProps) {
  return (
    <nav aria-label="버전 이력">
      <h2 className="px-12pxr pb-8pxr text-caption font-bold text-muted-foreground">버전 이력</h2>
      <ul className="flex flex-col gap-2pxr">
        {ruleSets.map(({ operatingRuleSetId, versionNo, effectiveDate, isCurrent }) => {
          const isSelected = operatingRuleSetId === selectedId
          return (
            <li key={operatingRuleSetId}>
              <button
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => onSelect(operatingRuleSetId)}
                className={cn(
                  'flex w-full cursor-pointer flex-col rounded-control px-12pxr py-10pxr text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30',
                  isSelected ? 'bg-primary-100' : 'hover:bg-muted',
                )}
              >
                <span className="flex items-center gap-8pxr">
                  <span className={cn('text-b1', isSelected && 'font-bold text-primary')}>
                    v{versionNo}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-4pxr text-caption text-success">
                      <span aria-hidden="true" className="size-6pxr rounded-full bg-success" />
                      적용 중
                    </span>
                  )}
                </span>
                <span className="text-caption text-muted-foreground tabular-nums">
                  {effectiveDate}부터
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
