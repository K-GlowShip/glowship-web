import { Skeleton } from '@/shared/ui/skeleton'

import { SkeletonFrame } from './skeleton-parts'

/** 지연 상세·운영 기준 같은 상세형 화면: 머리 → 요약 4칸 → 영역 두 개 */
export function DetailSkeleton() {
  return (
    <SkeletonFrame>
      <div className="flex flex-col gap-8pxr">
        <Skeleton className="h-16pxr w-56pxr" />
        <Skeleton className="h-44pxr w-280pxr max-w-full" />
        <Skeleton className="h-20pxr w-320pxr max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-16pxr lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-96pxr rounded-card" />
        ))}
      </div>
      <Skeleton className="h-200pxr rounded-panel" />
      <Skeleton className="h-280pxr rounded-panel" />
    </SkeletonFrame>
  )
}
