import { HeaderSkeleton, SkeletonFrame, TableCardSkeleton } from './skeleton-parts'

/** 제목 + 조회 조건과 표가 든 카드. 지연 목록·의사결정 이력·고객사 계정 관리가 같은 모양이다 */
export function ListSkeleton() {
  return (
    <SkeletonFrame>
      <HeaderSkeleton />
      <TableCardSkeleton />
    </SkeletonFrame>
  )
}
