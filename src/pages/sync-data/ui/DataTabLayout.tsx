import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import type { Page } from '@/shared/api'
import type { ListQuery } from '@/shared/ui/table'
import { TableTemplate } from '@/shared/ui/table-template'

interface DataTabLayoutProps {
  /** 검색 입력의 id. 탭마다 달라야 레이블이 연결된다. */
  searchId: string
  searchLabel: string
  searchPlaceholder: string
  input: string
  onInputChange: (value: string) => void
  /** "조회" 버튼이나 Enter로 검색어를 확정할 때 */
  onSubmit: () => void
  /** 목록 query. 건수·페이지 수와 불러오는 중·오류 표시에 쓴다. */
  query: Omit<ListQuery<unknown>, 'data'> & { data: Page<unknown> | undefined }
  page: number
  onPageChange: (page: number) => void
  /** 표 위쪽 제목. 예: 재고 탭의 기준일 */
  Title?: ReactNode
  /** 표 위쪽 오른쪽 컨트롤. 예: "오류만 보기" 체크박스 */
  Controls?: ReactNode
  /** 표(Table). 불러오는 중·오류·빈 결과 행은 표가 `query`로 직접 그린다. */
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
  query,
  page,
  onPageChange,
  Title,
  Controls,
  children,
}: DataTabLayoutProps) {
  const { data, isFetching } = query

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
              className="pl-40pxr"
              placeholder={searchPlaceholder}
              maxLength={100}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-44pxr" loading={isFetching}>
            조회
          </Button>
        </div>
      </form>

      <TableTemplate
        Title={Title}
        totalCount={data?.totalCount}
        page={page}
        pageCount={data ? Math.max(1, data.totalPages) : undefined}
        onPageChange={onPageChange}
        Controls={Controls}
      >
        {children}
      </TableTemplate>
    </div>
  )
}
