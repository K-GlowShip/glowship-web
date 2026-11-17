import { Calendar as CalendarIcon, X } from 'lucide-react'
import { type ComponentProps, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

import { formatDisplayDate, parseDateString, toDateString } from './date-string'

interface DateInputProps extends Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'children'> {
  /** 스크린리더가 읽는 이름. 고른 날짜가 있으면 이름 뒤에 붙여 읽는다 */
  label: string
  /** 'YYYY-MM-DD' 형식. 아직 고르지 않았으면 빈 문자열 */
  value: string
  onChange: (value: string) => void
}

/** 날짜 하나를 고르는 입력. 누르면 달력이 열리고, 날짜를 고르면 닫힌다. 고른 날짜는 X 버튼으로 지운다. 기간은 `DateRangeInput`을 쓴다. */
export function DateInput({ className, label, value, onChange, ...props }: DateInputProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selected = parseDateString(value)

  const handleClear = () => {
    onChange('')
    // 지우기 버튼이 사라지므로 포커스를 날짜 칸으로 돌려준다
    triggerRef.current?.focus()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          data-slot="date-input"
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'flex h-44pxr w-full items-center rounded-control border border-input bg-card pr-8pxr',
            'has-[[data-slot=date-input-trigger]:focus-visible]:border-primary has-[[data-slot=date-input-trigger]:focus-visible]:shadow-[inset_0_0_0_1px_var(--color-primary)] has-[[data-slot=date-input-trigger]:focus-visible]:ring-[3px] has-[[data-slot=date-input-trigger]:focus-visible]:ring-primary/20',
            'data-[state=open]:border-primary data-[state=open]:shadow-[inset_0_0_0_1px_var(--color-primary)] data-[state=open]:ring-[3px] data-[state=open]:ring-primary/20',
            'has-aria-invalid:border-danger has-aria-invalid:shadow-[inset_0_0_0_1px_var(--color-danger)] has-aria-invalid:ring-danger/20',
            className,
          )}
        >
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              type="button"
              data-slot="date-input-trigger"
              aria-label={value ? `${label} ${formatDisplayDate(value)}` : label}
              className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-8pxr pl-12pxr text-b1 text-foreground tabular-nums outline-none"
              {...props}
            >
              <CalendarIcon
                className="size-18pxr shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              {value ? (
                formatDisplayDate(value)
              ) : (
                <span className="text-muted-foreground">날짜 선택</span>
              )}
            </button>
          </PopoverTrigger>
          <button
            type="button"
            aria-label={`${label} 지우기`}
            className={cn(
              'inline-flex size-28pxr shrink-0 cursor-pointer items-center justify-center rounded-control text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/20',
              // 값이 없을 때도 자리는 남겨 두어, 날짜를 고르는 순간 칸이 밀리지 않게 한다
              !value && 'invisible',
            )}
            onClick={handleClear}
          >
            <X className="size-16pxr" aria-hidden="true" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        ref={contentRef}
        align="end"
        className="w-auto"
        // 열릴 때 첫 버튼(이전 달 화살표) 대신 선택된 날이나 오늘로 포커스를 보내 방향키로 바로 움직이게 한다.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          contentRef.current?.querySelector<HTMLElement>('td button[tabindex="0"]')?.focus()
        }}
      >
        <Calendar
          mode="single"
          defaultMonth={selected}
          selected={selected}
          classNames={{
            selected:
              '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-700',
          }}
          onSelect={(day) => {
            // 같은 날을 다시 눌러도 선택을 풀지 않는다
            if (day) {
              onChange(toDateString(day))
            }
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
