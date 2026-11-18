import type { ReactNode } from 'react'

import { Skeleton } from '@/shared/ui/skeleton'

/** 페이지 뼈대의 바깥 틀. 스크린 리더에는 한 번만 알린다 */
export function SkeletonFrame({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex min-w-0 flex-col gap-24pxr">
      <span className="sr-only">불러오는 중입니다.</span>
      {children}
    </div>
  )
}

/** 화면 제목(h1)과 설명 한 줄 */
export function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-8pxr">
      <Skeleton className="h-32pxr w-200pxr max-w-full" />
      <Skeleton className="h-16pxr w-320pxr max-w-full" />
    </div>
  )
}

/** 조회 조건 줄과 표(머리글 + 행 다섯 개)가 든 카드 */
export function TableCardSkeleton() {
  return (
    <div className="flex flex-col gap-16pxr rounded-panel border border-border bg-card p-24pxr">
      <div className="flex flex-wrap gap-8pxr">
        <Skeleton className="h-40pxr w-full lg:w-280pxr" />
        <Skeleton className="h-40pxr w-96pxr" />
        <Skeleton className="h-40pxr w-96pxr" />
      </div>
      <Skeleton className="h-40pxr" />
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-48pxr" />
      ))}
    </div>
  )
}
