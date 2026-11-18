import { Skeleton } from '@/shared/ui/skeleton'

import {
  HeaderSkeleton,
  PaginationSkeleton,
  SkeletonFrame,
  TableSkeleton,
  TabsRowSkeleton,
} from './skeleton-parts'

/**
 * 의사결정 이력: 제목 → 카드(상태 탭 · 조회 기간과 검색어 · 총 건수 · 표 · 페이지 이동).
 * 카드 안쪽 여백과 간격은 실제 화면(DecisionHistoryPage·HistoryFilters)과 같다.
 */
export function HistorySkeleton() {
  return (
    <SkeletonFrame>
      <HeaderSkeleton />
      <div className="flex flex-col gap-16pxr rounded-panel border border-border bg-card px-24pxr pt-12pxr pb-24pxr">
        <div className="flex flex-col gap-24pxr">
          <TabsRowSkeleton count={4} />
          <div className="flex flex-wrap items-end gap-16pxr">
            <div className="flex w-full max-w-360pxr flex-col gap-8pxr">
              <Skeleton className="h-18pxr w-60pxr" />
              <Skeleton className="h-44pxr" />
            </div>
            <div className="flex w-full max-w-420pxr flex-col gap-8pxr">
              <Skeleton className="h-18pxr w-72pxr" />
              <div className="flex items-center gap-8pxr">
                <Skeleton className="h-44pxr min-w-0 flex-1" />
                <Skeleton className="h-44pxr w-72pxr shrink-0" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-16pxr">
          <Skeleton className="h-18pxr w-80pxr" />
          <TableSkeleton rows={6} rowClassName="h-80pxr" />
          <PaginationSkeleton />
        </div>
      </div>
    </SkeletonFrame>
  )
}
