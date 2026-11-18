import { Skeleton } from '@/shared/ui/skeleton'

import {
  HeaderSkeleton,
  PaginationSkeleton,
  SkeletonFrame,
  TableSkeleton,
  TabsRowSkeleton,
} from './skeleton-parts'

/**
 * 지연 대응 센터 목록: 제목 → 카드(상태 탭 · 검색과 새 지연 보기 스위치 · 총 건수 · 표 · 페이지 이동).
 * 카드 안쪽 여백과 간격은 실제 화면(DelayCenterPage)과 같다.
 */
export function DelayCenterSkeleton() {
  return (
    <SkeletonFrame>
      <HeaderSkeleton />
      <div className="flex flex-col gap-16pxr rounded-panel border border-border bg-card px-24pxr pt-12pxr pb-24pxr">
        <TabsRowSkeleton count={5} />
        <div className="flex flex-wrap items-center justify-between gap-x-16pxr gap-y-8pxr">
          <div className="flex min-w-0 items-center gap-8pxr">
            <Skeleton className="h-44pxr w-full min-w-0 flex-1 md:w-320pxr md:flex-none" />
            <Skeleton className="h-44pxr w-72pxr shrink-0" />
          </div>
          <Skeleton className="h-22pxr w-108pxr" />
        </div>
        <div className="flex flex-col gap-16pxr">
          <Skeleton className="h-18pxr w-80pxr" />
          <TableSkeleton rows={8} rowClassName="h-64pxr" />
          <PaginationSkeleton />
        </div>
      </div>
    </SkeletonFrame>
  )
}
