import { Calendar as CalendarIcon, X } from 'lucide-react'
import { type ComponentProps, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverAnchor, PopoverContent } from '@/shared/ui/popover'

import { formatDisplayDate, parseDateString, toDateString } from './date-string'

export interface DateRange {
  start: string
  end: string
}

type Field = 'start' | 'end'

interface DateRangeInputProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** 'YYYY-MM-DD' 형식. 아직 고르지 않았으면 빈 문자열 */
  value: DateRange
  onChange: (range: DateRange) => void
  /** 시작일 칸에 붙는다. 바깥의 <Label htmlFor>와 연결할 때 쓴다. */
  id?: string
}

/**
 * 시작일과 종료일 입력 칸 두 개가 한 상자에 있는 기간 입력.
 * 칸을 누르면 달력이 열리고, 시작일을 고르면 곧바로 종료일 선택으로 넘어간다.
 */
export function DateRangeInput({ className, value, onChange, id, ...props }: DateRangeInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeField, setActiveField] = useState<Field>('start')

  const start = parseDateString(value.start)
  const end = parseDateString(value.end)
  const hasValue = Boolean(value.start || value.end)

  const openField = (field: Field) => {
    setActiveField(field)
    setOpen(true)
  }

  const handleSelect = (_range: unknown, day: Date) => {
    const picked = toDateString(day)
    const isPickingEnd = activeField === 'end' && start !== undefined && day >= start

    if (isPickingEnd) {
      onChange({ start: value.start, end: picked })
      setOpen(false)
      return
    }
    // 시작일을 고른 경우: 종료일이 새 시작일보다 빠르면 비우고, 종료일 선택으로 넘어간다.
    onChange({ start: picked, end: end && day <= end ? value.end : '' })
    setActiveField('end')
  }

  const handleReset = () => {
    onChange({ start: '', end: '' })
    setActiveField('start')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={containerRef}
          data-slot="date-range-input"
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'flex h-44pxr w-full items-center gap-4pxr rounded-control border border-input bg-card px-8pxr',
            'data-[state=open]:border-primary data-[state=open]:shadow-[inset_0_0_0_1px_var(--color-primary)] data-[state=open]:ring-[3px] data-[state=open]:ring-primary/20',
            className,
          )}
          {...props}
        >
          <span className="inline-flex size-28pxr shrink-0 items-center justify-center text-muted-foreground">
            <CalendarIcon className="size-18pxr" aria-hidden="true" />
          </span>
          <DateField
            id={id}
            label="시작일"
            value={value.start}
            active={open && activeField === 'start'}
            onClick={() => openField('start')}
          />
          <span className="text-muted-foreground" aria-hidden="true">
            –
          </span>
          <DateField
            label="종료일"
            value={value.end}
            active={open && activeField === 'end'}
            onClick={() => openField('end')}
          />
          <button
            type="button"
            aria-label="기간 초기화"
            className={cn(
              'inline-flex size-28pxr shrink-0 cursor-pointer items-center justify-center rounded-control text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/20',
              // 값이 없을 때도 자리는 남겨 두어, 값을 고르는 순간 칸이 밀리지 않게 한다.
              !hasValue && 'invisible',
            )}
            onClick={handleReset}
          >
            <X className="size-16pxr" aria-hidden="true" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        ref={contentRef}
        className="w-auto"
        // 열릴 때 첫 버튼(이전 달 화살표) 대신 선택된 날이나 오늘로 포커스를 보내 방향키로 바로 움직이게 한다.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          contentRef.current?.querySelector<HTMLElement>('td button[tabindex="0"]')?.focus()
        }}
        // 입력 칸을 눌러 시작일/종료일을 바꿀 때 달력이 닫혔다 열리지 않게 한다.
        onInteractOutside={(event) => {
          if (containerRef.current?.contains(event.target as Node)) {
            event.preventDefault()
          }
        }}
      >
        <Calendar
          mode="range"
          defaultMonth={(activeField === 'end' ? end : start) ?? start ?? end}
          // 시작일만 골랐을 때도 그 날이 선택된 모양으로 보이도록, 종료일이 없으면 같은 날로 채운다.
          selected={{ from: start ?? end, to: end ?? start }}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateFieldProps extends Omit<ComponentProps<'button'>, 'value'> {
  /** 화면 문구이자 스크린리더가 읽는 이름. 값이 없을 때는 안내 문구로도 쓴다. */
  label: string
  /** 'YYYY-MM-DD' 형식. 비어 있으면 label을 흐리게 보여 준다. */
  value: string
  /** 지금 달력에서 고르고 있는 칸인지 */
  active: boolean
}

/** 기간 입력 안에서 시작일 또는 종료일 하나를 보여 주는 칸. 누르면 달력이 열린다. */
function DateField({ label, value, active, className, ...props }: DateFieldProps) {
  return (
    <button
      type="button"
      aria-label={label}
      data-active={active}
      className={cn(
        'min-w-0 flex-1 cursor-pointer rounded-control px-8pxr py-4pxr text-center text-b1 outline-none',
        'data-[active=true]:bg-primary-100',
        className,
      )}
      {...props}
    >
      {value ? formatDisplayDate(value) : <span className="text-muted-foreground">{label}</span>}
    </button>
  )
}
