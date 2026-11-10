import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Pagination } from '@/shared/ui/pagination'

interface TableTemplateProps extends ComponentProps<'div'> {
  /** 표 위에 보여 주는 제목. 없으면 총 건수만 보인다. */
  Title?: ReactNode
  /** 모든 필터를 적용한 전체 건수. 아직 모르면(불러오지 못함) 생략하면 건수를 보여 주지 않는다. */
  totalCount?: number
  /** 위쪽 오른쪽에 놓는 컨트롤. 예: 불러올 개수 드롭다운, "오류만 보기" 체크박스 */
  Controls?: ReactNode
  /** 현재 페이지. 1부터 시작 */
  page: number
  /** 전체 페이지 수. 생략하면 페이지 이동을 보여 주지 않는다. */
  pageCount?: number
  onPageChange: (page: number) => void
  /** 표(Table) */
  children: ReactNode
}

/**
 * 목록 화면의 공통 틀: [제목 · 총 건수 · 오른쪽 컨트롤] → 표 → 페이지 이동.
 * 표 안은 화면마다 다르므로 children으로 받고, 서버 응답의 page · totalCount · totalPages를 그대로 받을 수 있게 값은 바깥에서 넘긴다.
 */
export function TableTemplate({
  className,
  Title,
  totalCount,
  Controls,
  page,
  pageCount,
  onPageChange,
  children,
  ...props
}: TableTemplateProps) {
  return (
    <div data-slot="table-template" className={cn('flex flex-col gap-16pxr', className)} {...props}>
      <div className="flex items-center justify-between gap-16pxr">
        <div className="min-w-0">
          {Title && <h2 className="text-h3 font-bold">{Title}</h2>}
          {totalCount !== undefined && (
            <p className="text-b2 text-muted-foreground">총 {formatNumber(totalCount)}건</p>
          )}
        </div>
        {Controls && <div className="flex shrink-0 items-center gap-8pxr">{Controls}</div>}
      </div>
      <div className="overflow-x-auto">{children}</div>
      {pageCount !== undefined && (
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      )}
    </div>
  )
}
