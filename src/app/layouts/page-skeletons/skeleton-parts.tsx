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
  // 실제 제목(text-h1, 40px)과 설명 한 줄(22px)의 높이에 맞춘다
  return (
    <div className="flex flex-col gap-0">
      <Skeleton className="h-40pxr w-200pxr max-w-full" />
      <Skeleton className="mt-4pxr h-18pxr w-320pxr max-w-full" />
    </div>
  )
}

/** 조회 조건 줄과 표(머리글 + 행 다섯 개)가 든 카드 */
export function TableCardSkeleton() {
  return (
    <div className="flex flex-col gap-16pxr rounded-panel border border-border bg-card p-24pxr">
      <div className="flex flex-wrap gap-8pxr">
        <Skeleton className="h-40pxr w-full web:w-280pxr" />
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

/** 탭 줄: 탭 이름 몇 개와 아래 경계선. 실제 탭 목록(42px)과 같은 높이다 */
export function TabsRowSkeleton({ count }: { count: number }) {
  return (
    <div className="flex h-42pxr items-center gap-24pxr border-b border-border">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-18pxr w-48pxr" />
      ))}
    </div>
  )
}

/** 표 한 장: 머리글 줄과 같은 높이의 행들. 목록이 길어도 처음 보이는 만큼만 그린다 */
export function TableSkeleton({ rows, rowClassName }: { rows: number; rowClassName: string }) {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-40pxr rounded-none" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={`flex items-center border-b border-border ${rowClassName}`}>
          <Skeleton className="h-20pxr w-full max-w-360pxr" />
        </div>
      ))}
    </div>
  )
}

/** 표 아래 페이지 이동 */
export function PaginationSkeleton() {
  return <Skeleton className="mx-auto h-36pxr w-240pxr max-w-full" />
}
