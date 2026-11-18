import { Skeleton } from '@/shared/ui/skeleton'

import { HeaderSkeleton, SkeletonFrame, TableCardSkeleton } from './skeleton-parts'

/** 연동 데이터 조회: 제목 → 원천별 수집 현황 카드 3개 → 탭과 표 */
export function SyncDataSkeleton() {
  return (
    <SkeletonFrame>
      <HeaderSkeleton />
      <div className="grid gap-12pxr md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-96pxr rounded-card" />
        ))}
      </div>
      <TableCardSkeleton />
    </SkeletonFrame>
  )
}
