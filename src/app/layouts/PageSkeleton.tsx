import { Skeleton } from '@/shared/ui/skeleton'

/** 화면 코드를 내려받는 동안 본문 자리에 보여 주는 뼈대 */
export function PageSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-24pxr">
      <span className="sr-only">불러오는 중입니다.</span>
      <div className="flex flex-col gap-8pxr">
        <Skeleton className="h-32pxr w-240pxr" />
        <Skeleton className="h-16pxr w-360pxr" />
      </div>
      <div className="grid gap-16pxr sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-120pxr rounded-card" />
        ))}
      </div>
      <Skeleton className="h-360pxr rounded-card" />
    </div>
  )
}
