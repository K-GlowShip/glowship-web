import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

import { getPageItems } from './page-items'

interface PaginationProps extends Omit<ComponentProps<'nav'>, 'onChange'> {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

const ITEM_CLASS =
  'flex size-32pxr items-center justify-center rounded-control text-b1 text-muted-foreground transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30'

export function Pagination({
  className,
  page,
  pageCount,
  onPageChange,
  ...props
}: PaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  return (
    <nav
      data-slot="pagination"
      aria-label="페이지 이동"
      className={cn('flex items-center justify-center gap-8pxr', className)}
      {...props}
    >
      <button
        type="button"
        aria-label="이전 페이지"
        className={cn(
          ITEM_CLASS,
          'cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40',
        )}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-16pxr" aria-hidden="true" />
      </button>
      {getPageItems(page, pageCount).map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className={ITEM_CLASS} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`${item}페이지`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              ITEM_CLASS,
              'cursor-pointer hover:bg-muted',
              item === page && 'bg-primary font-bold text-primary-foreground hover:bg-primary',
            )}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="다음 페이지"
        className={cn(
          ITEM_CLASS,
          'cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40',
        )}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-16pxr" aria-hidden="true" />
      </button>
    </nav>
  )
}
