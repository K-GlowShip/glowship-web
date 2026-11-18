import { HeaderSkeleton, SkeletonFrame, TableCardSkeleton } from './skeleton-parts'

/** 제목 + 조회 조건과 표가 든 카드. 고객사 계정 관리 같은 목록형 화면에 쓴다 */
export function ListSkeleton() {
  return (
    <SkeletonFrame>
      <HeaderSkeleton />
      <TableCardSkeleton />
    </SkeletonFrame>
  )
}
