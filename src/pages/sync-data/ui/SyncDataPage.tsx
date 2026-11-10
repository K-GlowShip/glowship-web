import { useQuery } from '@tanstack/react-query'

import { getSyncOverview, SYNC_CARDS } from '@/entities/data-sync-run'
import { dataSyncRunQueries } from '@/shared/api'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { SyncDataTabs } from './SyncDataTabs'
import { SyncStatusPanel } from './SyncStatusPanel'

export function SyncDataPage() {
  const { data, error, isPending, isFetching, refetch } = useQuery(dataSyncRunQueries.latest())

  // 서버는 원천 5종을 항상 내려준다. 시스템별 카드(ERP·WMS·TMS)로 묶어 계산한다.
  const overview = data ? getSyncOverview(data.items) : null

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
        {isPending && (
          <div className="grid gap-12pxr md:grid-cols-3" aria-hidden="true">
            {SYNC_CARDS.map(({ system }) => (
              <Skeleton key={system} className="h-96pxr rounded-card" />
            ))}
          </div>
        )}
        {error && !data && (
          <QueryError message={error.message} loading={isFetching} onRetry={() => void refetch()} />
        )}
        {overview && <SyncStatusPanel overview={overview} />}
      </section>

      <SyncDataTabs />
    </div>
  )
}
