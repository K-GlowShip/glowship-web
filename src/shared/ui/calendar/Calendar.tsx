import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { ko } from 'react-day-picker/locale'

import { cn } from '@/shared/lib/cn'

// 선택 상태는 날짜 칸(td)에 붙는 data-* 속성으로 구분한다.
const NAV_BUTTON_CLASS = cn(
  'inline-flex size-32pxr cursor-pointer items-center justify-center rounded-control text-muted-foreground outline-none',
  'hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/20',
  'aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
)

/** react-day-picker에 디자인 토큰을 입힌 달력. 기본은 한국어, 일요일 시작이다. */
export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      locale={ko}
      showOutsideDays
      className={cn('w-fit', className)}
      classNames={{
        months: 'relative flex flex-col gap-16pxr sm:flex-row',
        month: 'flex flex-col gap-8pxr',
        month_caption: 'flex h-32pxr items-center justify-center',
        caption_label: 'text-b1 font-semibold text-foreground',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: NAV_BUTTON_CLASS,
        button_next: NAV_BUTTON_CLASS,
        month_grid: 'border-collapse',
        weekday: 'size-36pxr text-center text-caption font-medium text-muted-foreground',
        day: cn(
          'relative size-36pxr p-0 text-center',
          'data-[outside]:[&>button]:text-disabled-foreground',
          'data-[disabled]:[&>button]:pointer-events-none data-[disabled]:[&>button]:text-disabled-foreground',
          // 오늘 표시는 선택되지 않은 날에만 입힌다. (Tailwind가 찾을 수 있게 클래스를 이어 붙이지 않고 그대로 쓴다)
          '[&[data-today]:not([data-selected])>button]:font-bold [&[data-today]:not([data-selected])>button]:text-primary',
        ),
        day_button: cn(
          'inline-flex size-36pxr cursor-pointer items-center justify-center rounded-control text-b1 text-foreground outline-none',
          'hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-primary/20',
        ),
        range_start:
          'rounded-l-control bg-primary-100 [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-700',
        range_end:
          'rounded-r-control bg-primary-100 [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary-700',
        range_middle:
          'bg-primary-100 first:rounded-l-control last:rounded-r-control [&>button]:rounded-none [&>button]:text-primary-800 [&>button]:hover:bg-primary-200',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) =>
          orientation === 'left' ? (
            <ChevronLeft className={cn('size-18pxr', chevronClass)} aria-hidden="true" />
          ) : (
            <ChevronRight className={cn('size-18pxr', chevronClass)} aria-hidden="true" />
          ),
      }}
      {...props}
    />
  )
}
