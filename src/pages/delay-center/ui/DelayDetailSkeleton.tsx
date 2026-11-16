import { Skeleton } from '@/shared/ui/skeleton'

/**
 * 지연 상세를 불러오는 동안 보여 주는 뼈대. 실제 화면(머리 → 상태 안내 → 영역 두 개)과 같은 자리·크기로 그려서,
 * 데이터가 오면 내용만 채워지고 배치가 움직이지 않게 한다.
 */
export function DelayDetailSkeleton() {
  return (
    <div role="status" className="flex min-w-0 flex-col gap-24pxr">
      <span className="sr-only">지연 상세를 불러오는 중입니다</span>

      <div className="flex flex-col gap-20pxr px-16pxr">
        <div className="flex items-start justify-between gap-16pxr">
          <div className="flex flex-col gap-8pxr">
            <Skeleton className="h-16pxr w-56pxr" />
            <div className="flex items-end gap-12pxr">
              <Skeleton className="h-44pxr w-280pxr max-w-full" />
              <Skeleton className="mb-8pxr h-24pxr w-72pxr rounded-full" />
            </div>
            <Skeleton className="h-20pxr w-320pxr max-w-full" />
          </div>
          <Skeleton className="h-40pxr w-96pxr shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-y-20pxr border-y border-primary-900/10 py-20pxr lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex flex-col gap-8pxr lg:border-l lg:border-primary-900/10 lg:pl-24pxr lg:first:border-l-0 lg:first:pl-0"
            >
              <Skeleton className="h-18pxr w-56pxr" />
              <Skeleton className="h-44pxr w-120pxr" />
              <Skeleton className="h-18pxr w-144pxr max-w-full" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-72pxr rounded-card" />

      <ChapterSkeleton titleWidth="w-96pxr" blocks={['h-72pxr', 'h-200pxr']} />
      <ChapterSkeleton titleWidth="w-144pxr" blocks={['h-240pxr']} />
    </div>
  )
}

/** 번호·제목이 있는 영역 하나의 뼈대 */
function ChapterSkeleton({ titleWidth, blocks }: { titleWidth: string; blocks: string[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-24pxr rounded-panel border border-border bg-card p-32pxr">
      <div className="flex items-baseline gap-12pxr">
        <Skeleton className="h-28pxr w-32pxr" />
        <Skeleton className={`h-28pxr ${titleWidth}`} />
      </div>
      {blocks.map((height) => (
        <Skeleton key={height} className={`w-full rounded-card ${height}`} />
      ))}
    </div>
  )
}
