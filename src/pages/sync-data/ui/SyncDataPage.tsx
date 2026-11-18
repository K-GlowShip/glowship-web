import { useQuery } from '@tanstack/react-query'

import { useSyncData, useSyncProgress } from '@/features/sync-data'
import { dashboardQueries } from '@/shared/api'
import { QueryError } from '@/shared/ui/query-error'
import { StatusPanelSkeleton } from '@/shared/ui/skeleton'

import { SyncDataTabs } from './SyncDataTabs'
import { SyncStatusPanel } from './SyncStatusPanel'

export function SyncDataPage() {
  const { mutate: sync, isPending: isSyncing } = useSyncData()
  // 마지막 수집 시각은 원천별 값이 아니라 고객사 전체 값(대시보드와 같은 기준 시각)을 쓴다
  const { data: summary } = useQuery(dashboardQueries.summary())
  const { error, isPending, isFetching, refetch, data, overview } = useSyncProgress()

  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">연동 데이터 조회</h1>
        <p className="text-b1 text-muted-foreground">연동한 데이터를 조회해보세요</p>
      </header>

      <section className="flex flex-col gap-12pxr" aria-label="데이터 수집 현황">
        {overview?.syncIntervalMinutes != null && (
          <p className="pr-12pxr text-right text-b2 text-muted-foreground">
            모든 데이터는 {overview.syncIntervalMinutes}분마다 자동으로 수집됩니다
          </p>
        )}
        {isPending && <StatusPanelSkeleton />}
        {error && !data && (
          <QueryError message={error.message} loading={isFetching} onRetry={() => void refetch()} />
        )}
        {overview && (
          <SyncStatusPanel
            overview={overview}
            lastSyncedAt={summary?.lastSyncedAt ?? null}
            isRequesting={isSyncing}
            onSync={() => sync()}
          />
        )}
      </section>

      <SyncDataTabs />
    </div>
  )
}
