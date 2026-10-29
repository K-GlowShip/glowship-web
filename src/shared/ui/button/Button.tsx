import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, MouseEvent } from 'react'

import { cn } from '@/shared/lib/cn'

import { buttonVariants } from './button-variants'

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

function Spinner() {
  return (
    <svg className="animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  type = 'button',
  onClick,
  children,
  ...props
}: ButtonProps) {
  // 로딩 중에도 색을 유지하고(disabled 스타일 X) 중복 실행만 막는다
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      data-slot="button"
      type={type}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleClick}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
