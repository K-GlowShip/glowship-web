import { DetailPageSkeleton, Skeleton } from '@/shared/ui/skeleton'

/**
 * 지연 상세 화면 코드를 내려받는 동안의 뼈대. 화면이 열린 뒤 데이터를 불러오는 동안 보이는 뼈대(DelayDetailPage)와
 * 같은 모양이라, 두 단계 사이에 뼈대가 바뀌어 보이지 않는다. "목록으로" 줄은 실제 화면과 같은 자리·여백으로 둔다.
 */
export function DelayDetailRouteSkeleton() {
  return (
    <div className="flex flex-col gap-16pxr">
      <div className="-mx-16pxr -mt-16pxr px-16pxr pt-16pxr pb-8pxr lg:m-0 lg:p-0">
        <Skeleton className="h-22pxr w-80pxr" />
      </div>
      <DetailPageSkeleton />
    </div>
  )
}
