import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

import { badgeVariants } from './badge-variants'

type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean
  }

export function Badge({ className, variant, dot = true, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-6pxr rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
