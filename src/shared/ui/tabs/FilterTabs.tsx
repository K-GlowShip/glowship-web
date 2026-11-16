import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'

import { Tabs, TabsList, TabsTrigger } from './Tabs'

export interface FilterTabOption<T extends string> {
  value: T
  label: string
  /** 그 탭에 해당하는 건수. 아직 모르면 생략하면 이름만 보인다 */
  count?: number
}

interface FilterTabsProps<T extends string> {
  options: FilterTabOption<T>[]
  value: T
  onValueChange: (value: T) => void
  /** 스크린리더가 읽는 탭 묶음의 이름. 예: "상태 필터" */
  'aria-label': string
}

/**
 * 목록 화면의 상태 탭. 누르면 곧바로 그 조건으로 다시 조회하는 필터 용도이고, 탭마다 내용 영역이 따로 없다.
 * 모양과 움직임(밑줄 미끄러짐, 좁은 화면 가로 스크롤, 키보드 포커스)은 `Tabs`를 그대로 따른다.
 * 방향키로 옮길 때마다 서버를 조회하지 않도록, Enter나 Space로 골라야 적용된다.
 */
export function FilterTabs<T extends string>({
  options,
  value,
  onValueChange,
  'aria-label': ariaLabel,
}: FilterTabsProps<T>) {
  return (
    <Tabs activationMode="manual" value={value} onValueChange={(next) => onValueChange(next as T)}>
      <TabsList aria-label={ariaLabel}>
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="shrink-0 items-baseline gap-6pxr"
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'text-caption tabular-nums',
                  option.value !== value && option.count === 0 && 'opacity-50',
                )}
              >
                {formatNumber(option.count)}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
