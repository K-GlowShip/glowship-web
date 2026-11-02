import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

/** 브라우저 기본 select에 Input과 같은 스타일을 입힌 선택 상자. */
export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative w-full">
      <select
        data-slot="select"
        className={cn(
          'h-44pxr w-full min-w-0 cursor-pointer appearance-none rounded-control border border-input bg-card pr-40pxr pl-12pxr text-b1 text-foreground outline-none',
          'focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] focus-visible:ring-[3px] focus-visible:ring-primary/20',
          'aria-invalid:border-danger aria-invalid:shadow-[inset_0_0_0_1px_var(--color-danger)] aria-invalid:ring-danger/20',
          'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-disabled-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}
