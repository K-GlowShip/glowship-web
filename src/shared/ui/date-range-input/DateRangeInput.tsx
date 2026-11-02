import { Calendar } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export interface DateRange {
  start: string
  end: string
}

interface DateRangeInputProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** 'YYYY-MM-DD' 형식 */
  value: DateRange
  onChange: (range: DateRange) => void
}

const DATE_INPUT_CLASS = 'min-w-0 flex-1 bg-transparent text-b1 text-foreground outline-none'

/** 시작일과 종료일을 한 상자 안에서 고르는 기간 입력. */
export function DateRangeInput({ className, value, onChange, ...props }: DateRangeInputProps) {
  return (
    <div
      data-slot="date-range-input"
      className={cn(
        'flex h-44pxr w-full items-center gap-8pxr rounded-control border border-input bg-card px-12pxr',
        'focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)] focus-within:ring-[3px] focus-within:ring-primary/20',
        className,
      )}
      {...props}
    >
      <Calendar className="size-18pxr shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="date"
        aria-label="시작일"
        className={DATE_INPUT_CLASS}
        value={value.start}
        max={value.end || undefined}
        onChange={(event) => onChange({ ...value, start: event.target.value })}
      />
      <span className="text-muted-foreground" aria-hidden="true">
        –
      </span>
      <input
        type="date"
        aria-label="종료일"
        className={DATE_INPUT_CLASS}
        value={value.end}
        min={value.start || undefined}
        onChange={(event) => onChange({ ...value, end: event.target.value })}
      />
    </div>
  )
}
