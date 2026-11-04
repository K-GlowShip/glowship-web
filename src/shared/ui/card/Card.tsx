import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('rounded-card border border-border bg-card text-foreground', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex items-center justify-between gap-8pxr px-24pxr pt-24pxr', className)}
      {...props}
    />
  )
}

interface CardTitleProps extends ComponentProps<'h3'> {
  /** 화면의 제목 계층에 맞춰 h2~h3 중에서 고른다. 기본은 h3 */
  as?: 'h2' | 'h3'
}

export function CardTitle({ as: Heading = 'h3', className, ...props }: CardTitleProps) {
  return (
    <Heading data-slot="card-title" className={cn('text-h3 font-bold', className)} {...props} />
  )
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-24pxr', className)} {...props} />
}
