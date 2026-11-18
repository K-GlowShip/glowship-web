import { Skeleton } from './Skeleton'

/**
 * 상태 요약 패널의 뼈대: 자동 수집 안내 줄 자리 → 위쪽 줄(라벨·값·버튼) → 구분선 → 열 셋(제목·부제·항목 둘).
 * 연동 데이터 조회의 수집 현황 패널(SyncStatusPanel)과 같은 구조라서, 화면 코드를 내려받는 동안(앱 레이아웃)과
 * 데이터를 불러오는 동안(화면)이 같은 뼈대를 쓴다. 두 단계가 다르면 뼈대가 두 번 바뀌어 보인다.
 */
export function StatusPanelSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-12pxr">
      {/* 실제로는 데이터가 온 뒤에 나오는 안내 줄(text-b2, 22px). 자리를 미리 잡아 두어 패널이 아래로 밀리지 않게 한다 */}
      <Skeleton className="ml-auto h-22pxr w-240pxr max-w-full" />
      <div className="flex flex-col gap-20pxr rounded-card border border-border bg-card p-24pxr">
        <div className="flex items-center justify-between gap-16pxr">
          <div className="flex flex-col gap-4pxr">
            <Skeleton className="h-14pxr w-56pxr" />
            <Skeleton className="h-22pxr w-160pxr" />
          </div>
          <Skeleton className="h-32pxr w-72pxr shrink-0" />
        </div>
        <ul className="grid gap-16pxr border-t border-border pt-20pxr md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {Array.from({ length: 3 }, (_, column) => (
            <li
              key={column}
              className="flex min-w-0 flex-col gap-12pxr md:px-24pxr md:first:pl-0 md:last:pr-0"
            >
              <div className="flex flex-col gap-4pxr">
                <Skeleton className="h-22pxr w-80pxr" />
                <Skeleton className="h-18pxr w-48pxr" />
              </div>
              <div className="flex flex-col gap-8pxr">
                {Array.from({ length: 2 }, (_, row) => (
                  <div key={row} className="flex items-center justify-between gap-12pxr">
                    <Skeleton className="h-18pxr w-40pxr" />
                    <Skeleton className="h-28pxr w-56pxr rounded-full" />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
