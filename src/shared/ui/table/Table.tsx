import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

/**
 * 열 너비를 내용이 아닌 헤더(TableHead)에 지정한 값으로 정한다(table-fixed).
 * 검색 결과에 따라 행 내용이 달라져도 열 너비가 흔들리지 않는다. 너비를 안 준 열은 남는 폭을 나눠 갖는다.
 */
export function Table({
  className,
  density = 'default',
  ...props
}: ComponentProps<'table'> & {
  /** compact는 셀 좌우 여백을 줄인다. 좁은 영역에 열이 많은 표에 쓴다. */
  density?: 'default' | 'compact'
}) {
  return (
    <table
      data-slot="table"
      data-density={density}
      className={cn('group/table w-full table-fixed text-b1', className)}
      {...props}
    />
  )
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
        'px-24pxr py-14pxr text-left text-caption font-bold whitespace-nowrap text-foreground group-data-[density=compact]/table:px-12pxr',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('px-24pxr py-12pxr group-data-[density=compact]/table:px-12pxr', className)}
      {...props}
    />
  )
}

/** 조건에 맞는 행이 없을 때 표 안에 보여 주는 안내 행. colSpan은 표의 열 개수. */
export function TableEmptyRow({
  colSpan,
  className,
  ...props
}: Omit<ComponentProps<'td'>, 'colSpan'> & { colSpan: number }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn('py-48pxr text-center text-muted-foreground', className)}
        {...props}
      />
    </TableRow>
  )
}

/** 목록을 불러오지 못했을 때 표 안에 보여 주는 오류 행. 표 머리글은 그대로 두어 화면이 출렁이지 않게 한다. */
export function TableErrorRow({
  colSpan,
  message,
  loading,
  onRetry,
}: {
  colSpan: number
  message: string
  /** 다시 요청하는 중이면 버튼을 막는다 */
  loading: boolean
  onRetry: () => void
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-48pxr text-center">
        <p role="alert" className="text-b1 text-muted-foreground">
          {message}
        </p>
        <Button
          variant="secondary"
          size="sm"
          loading={loading}
          className="mt-12pxr"
          onClick={onRetry}
        >
          다시 시도
        </Button>
      </TableCell>
    </TableRow>
  )
}
