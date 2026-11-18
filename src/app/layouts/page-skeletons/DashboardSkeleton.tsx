import { Skeleton } from '@/shared/ui/skeleton'

import { SkeletonFrame } from './skeleton-parts'

/**
 * 대시보드: 실제 화면의 구획(요약 → 지연 목록 → 입고 추이·수집 현황 → 재고)을 같은 순서와 비슷한 높이의 덩어리로 둔다.
 * 요약은 안의 내용까지 흉내 내지 않고 배경 덩어리 하나만 둔다. 높이는 데이터가 찬 실제 화면의 대략 값이다
 * (입고 추이·수집 현황은 xl부터 나란히, 그 아래 폭에서는 위아래로 쌓인다).
 */
export function DashboardSkeleton() {
  return (
    <SkeletonFrame>
      <Skeleton className="h-640pxr rounded-panel xl:h-540pxr" />
      <Skeleton className="h-560pxr rounded-card lg:h-520pxr" />
      <div className="grid gap-24pxr xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-480pxr rounded-card" />
        <Skeleton className="h-300pxr rounded-card xl:h-full" />
      </div>
      <Skeleton className="h-760pxr rounded-card lg:h-560pxr" />
    </SkeletonFrame>
  )
}
