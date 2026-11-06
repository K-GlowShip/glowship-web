import type { ReactNode } from 'react'

import { Skeleton } from '@/shared/ui/skeleton'

import { TableCell, TableEmptyRow, TableErrorRow, TableRow } from './Table'

/**
 * 목록 query에서 표가 쓰는 값. `useQuery` 결과를 그대로 넘기면 된다.
 * 표는 행(`items`)만 필요하다. 건수·페이지 수는 `TableTemplate`을 쓰는 쪽이 따로 읽으므로 응답 규칙에 묶이지 않는다.
 */
export interface ListQuery<T> {
  data: { items: T[] } | undefined
  error: { message: string } | null
  isFetching: boolean
  refetch: () => unknown
}

interface TableQueryRowsProps<T> {
  query: ListQuery<T>
  /** 표의 열 개수 */
  colSpan: number
  /** 결과가 하나도 없을 때 보여 주는 문구 */
  emptyMessage: string
  /** 받은 행으로 표의 행을 그린다 */
  children: (items: T[]) => ReactNode
}

const SKELETON_ROW_COUNT = 5

/**
 * 표 본문의 행. 목록 query의 상태에 따라 불러오는 중(스켈레톤 행), 오류 행(다시 시도), 빈 행, 데이터 행 중 하나를 그린다.
 * 표 머리글은 호출하는 쪽이 항상 그리므로, 어떤 상태에서도 표의 모양이 바뀌지 않는다.
 */
export function TableQueryRows<T>({
  query,
  colSpan,
  emptyMessage,
  children,
}: TableQueryRowsProps<T>) {
  const { data, error, isFetching, refetch } = query

  if (!data) {
    return error ? (
      <TableErrorRow
        colSpan={colSpan}
        message={error.message}
        loading={isFetching}
        onRetry={() => void refetch()}
      />
    ) : (
      <TableSkeletonRows colSpan={colSpan} />
    )
  }
  if (data.items.length === 0) {
    return <TableEmptyRow colSpan={colSpan}>{emptyMessage}</TableEmptyRow>
  }
  return children(data.items)
}

function TableSkeletonRows({ colSpan }: { colSpan: number }) {
  return Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell colSpan={colSpan}>
        <Skeleton className="h-24pxr w-full" />
      </TableCell>
    </TableRow>
  ))
}
