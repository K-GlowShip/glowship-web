import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'h-44pxr w-full min-w-0 rounded-control border border-input bg-card px-12pxr text-b1 text-foreground outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] focus-visible:ring-[3px] focus-visible:ring-primary/20',
        'aria-invalid:border-danger aria-invalid:shadow-[inset_0_0_0_1px_var(--color-danger)] aria-invalid:ring-danger/20',
        'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-disabled-foreground',
        className,
      )}
      {...props}
    />
  )
}
