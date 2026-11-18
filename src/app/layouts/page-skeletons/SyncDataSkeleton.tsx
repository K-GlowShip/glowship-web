import { Skeleton, StatusPanelSkeleton } from '@/shared/ui/skeleton'

import {
  HeaderSkeleton,
  PaginationSkeleton,
  SkeletonFrame,
  TableSkeleton,
  TabsRowSkeleton,
} from './skeleton-parts'

/**
 * 연동 데이터 조회: 제목 → 수집 현황 패널(마지막 수집·동기화 + 시스템 3열) → 카드(탭 · 검색 · 총 건수 · 표 · 페이지 이동).
 * 카드 안쪽 여백(32px)과 간격은 실제 화면(SyncDataTabs·DataTabLayout)과 같다.
 */
export function SyncDataSkeleton() {
  return (
    <SkeletonFrame>
      <HeaderSkeleton />
      <StatusPanelSkeleton />
      <div className="rounded-panel border border-border bg-card p-32pxr">
        <TabsRowSkeleton count={4} />
        <div className="flex flex-col gap-16pxr pt-24pxr">
          <div className="flex flex-col gap-8pxr">
            <Skeleton className="h-18pxr w-72pxr" />
            <div className="flex items-center gap-8pxr">
              <Skeleton className="h-44pxr max-w-500pxr min-w-0 flex-1" />
              <Skeleton className="h-44pxr w-72pxr shrink-0" />
            </div>
          </div>
          <Skeleton className="h-18pxr w-80pxr" />
          <TableSkeleton rows={8} rowClassName="h-52pxr" />
          <PaginationSkeleton />
        </div>
      </div>
    </SkeletonFrame>
  )
}
