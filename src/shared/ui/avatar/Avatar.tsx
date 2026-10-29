import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export function Avatar({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        'inline-flex size-32pxr shrink-0 items-center justify-center rounded-full bg-primary-100 text-b2 font-bold text-primary',
        className,
      )}
      {...props}
    />
  )
}
