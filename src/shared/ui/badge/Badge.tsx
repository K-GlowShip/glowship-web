import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

import { badgeVariants } from './badge-variants'

type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean
    /** 점이 물결처럼 퍼져 강조한다(예: 위험 상태). `dot`이 꺼져 있으면 무시한다. 동작 줄이기를 켜면 멈춘다 */
    pulse?: boolean
  }

export function Badge({
  className,
  variant,
  dot = true,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot &&
        (pulse ? (
          <span className="relative flex size-6pxr" aria-hidden="true">
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
            <span className="relative size-6pxr rounded-full bg-current" />
          </span>
        ) : (
          <span className="size-6pxr rounded-full bg-current" aria-hidden="true" />
        ))}
      {children}
    </span>
  )
}
