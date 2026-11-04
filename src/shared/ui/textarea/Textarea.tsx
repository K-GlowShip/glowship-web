import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-96pxr w-full resize-y rounded-control border border-input bg-card px-12pxr py-10pxr text-b1 text-foreground outline-none',
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
