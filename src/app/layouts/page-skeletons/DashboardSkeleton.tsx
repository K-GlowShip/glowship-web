import { Skeleton } from '@/shared/ui/skeleton'

import { SkeletonFrame } from './skeleton-parts'

/** 대시보드: 요약(지표 4개) → 지연 항로 → 입고 추이·수집 현황 → 재고 표 */
export function DashboardSkeleton() {
  return (
    <SkeletonFrame>
      <div className="flex flex-col gap-24pxr rounded-panel bg-muted/60 p-24pxr lg:p-32pxr">
        <Skeleton className="h-40pxr w-320pxr max-w-full" />
        <div className="grid grid-cols-2 gap-16pxr lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-96pxr rounded-card bg-card" />
          ))}
        </div>
      </div>
      <Skeleton className="h-200pxr rounded-panel" />
      <div className="grid gap-24pxr lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-320pxr rounded-panel" />
        <Skeleton className="h-320pxr rounded-panel" />
      </div>
      <Skeleton className="h-280pxr rounded-panel" />
    </SkeletonFrame>
  )
}
