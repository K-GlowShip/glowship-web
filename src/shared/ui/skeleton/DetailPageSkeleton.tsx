import { Skeleton } from './Skeleton'

/**
 * 상세형 화면의 뼈대(머리 → 요약 네 칸 → 상태 안내 → 영역 두 개). 실제 지연 상세와 같은 자리·크기로 그려서,
 * 데이터가 오면 내용만 채워지고 배치가 움직이지 않게 한다.
 * 화면 코드를 내려받는 동안(앱 레이아웃)과 데이터를 불러오는 동안(화면)이 같은 뼈대를 쓰도록 shared에 둔다.
 * 두 단계가 다른 모양이면 뼈대가 두 번 바뀌어 "따닥" 하고 보인다.
 */
export function DetailPageSkeleton() {
  return (
    <div role="status" className="flex min-w-0 flex-col gap-24pxr">
      <span className="sr-only">불러오는 중입니다.</span>

      <div className="flex flex-col gap-20pxr px-16pxr">
        <div className="flex items-start justify-between gap-16pxr">
          <div className="flex flex-col gap-8pxr">
            <Skeleton className="h-16pxr w-56pxr" />
            <div className="flex flex-wrap items-end gap-12pxr">
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
