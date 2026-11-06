import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

import type { ApiError, Page } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { TableTemplate } from '@/shared/ui/table-template'

import { QueryError } from './QueryError'

interface DataTabLayoutProps {
  /** 검색 입력의 id. 탭마다 달라야 레이블이 연결된다. */
  searchId: string
  searchLabel: string
  searchPlaceholder: string
  input: string
  onInputChange: (value: string) => void
  /** "조회" 버튼이나 Enter로 검색어를 확정할 때 */
  onSubmit: () => void
  /** 서버 응답. 아직 받지 못했으면 undefined */
  data: Page<unknown> | undefined
  error: ApiError | null
  isFetching: boolean
  onRetry: () => void
  page: number
  onPageChange: (page: number) => void
  /** 표 위쪽 제목. 예: 재고 탭의 기준일 */
  Title?: ReactNode
  /** 표 위쪽 오른쪽 컨트롤. 예: "오류만 보기" 체크박스 */
  Controls?: ReactNode
  /** 표(Table) */
  children: ReactNode
}

/** 연동 데이터 탭의 공통 틀: 검색(조회 버튼) → (불러오는 중 · 오류 · 표와 페이지 이동) */
export function DataTabLayout({
  searchId,
  searchLabel,
  searchPlaceholder,
  input,
  onInputChange,
  onSubmit,
  data,
  error,
  isFetching,
  onRetry,
  page,
  onPageChange,
  Title,
  Controls,
  children,
}: DataTabLayoutProps) {
  return (
    <div className="flex flex-col gap-16pxr pt-24pxr">
      <form
        role="search"
        className="flex flex-col gap-8pxr"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <Label htmlFor={searchId}>{searchLabel}</Label>
        <div className="flex items-center gap-8pxr">
          <div className="relative max-w-500pxr min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={searchId}
              className="h-48pxr pl-40pxr"
              placeholder={searchPlaceholder}
              maxLength={100}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
            />
          </div>
          <Button type="submit" size="lg" loading={isFetching}>
            조회
          </Button>
        </div>
      </form>

      {data ? (
        <TableTemplate
          Title={Title}
          totalCount={data.totalCount}
          page={page}
          pageCount={Math.max(1, data.totalPages)}
          onPageChange={onPageChange}
          Controls={Controls}
        >
          {children}
        </TableTemplate>
      ) : error ? (
        <QueryError message={error.message} loading={isFetching} onRetry={onRetry} />
      ) : (
        <Skeleton className="h-300pxr rounded-card" />
      )}
    </div>
  )
}
