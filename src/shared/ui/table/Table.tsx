import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return <table data-slot="table" className={cn('w-full text-b1', className)} {...props} />
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('bg-primary-50', className)} {...props} />
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={className} {...props} />
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('border-b border-border last:border-b-0', className)}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'px-24pxr py-14pxr text-left text-caption font-bold text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('px-24pxr py-18pxr', className)} {...props} />
}
