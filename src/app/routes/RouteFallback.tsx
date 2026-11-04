import { PageSkeleton } from '@/app/layouts/PageSkeleton'
import { Skeleton } from '@/shared/ui/skeleton'

/** 처음 들어올 때 화면 코드를 내려받는 동안 보여 주는, 레이아웃 모양의 대기 화면 */
export function RouteFallback() {
  return (
    <div className="flex h-screen">
      <aside className="flex w-200pxr shrink-0 flex-col gap-8pxr border-r border-border bg-card p-16pxr">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-41pxr rounded-card" />
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="h-64pxr shrink-0 border-b border-border bg-card" />
        <main className="min-h-0 flex-1 overflow-y-auto p-28pxr">
          <PageSkeleton />
        </main>
      </div>
    </div>
  )
}
