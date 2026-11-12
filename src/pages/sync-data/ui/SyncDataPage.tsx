import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { getSyncOverview, SYNC_CARDS } from '@/entities/data-sync-run'
import { dashboardQueries, dataSyncRunQueries, isMeQuery } from '@/shared/api'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { useSyncData } from '../model/use-sync-data'
import { SyncDataTabs } from './SyncDataTabs'
import { SyncStatusPanel } from './SyncStatusPanel'

/** 수집이 도는 동안 현황을 다시 조회하는 간격. 적용은 요청 응답 뒤에 서버가 이어서 하므로 끝나는 때를 알아야 한다 */
const RUNNING_REFETCH_MS = 3000

export function SyncDataPage() {
  const queryClient = useQueryClient()
  const { mutate: sync, isPending: isSyncing } = useSyncData()
  // 마지막 수집 시각은 원천별 값이 아니라 고객사 전체 값(대시보드와 같은 기준 시각)을 쓴다
  const { data: summary } = useQuery(dashboardQueries.summary())
  const { data, error, isPending, isFetching, refetch } = useQuery({
    ...dataSyncRunQueries.latest(),
    refetchInterval: (query) => {
      const items = query.state.data?.items
      return items && getSyncOverview(items).isRunning ? RUNNING_REFETCH_MS : false
    },
  })

  // 서버는 원천 5종을 항상 내려준다. 시스템별 카드(ERP·WMS·TMS)로 묶어 계산한다.
  const overview = data ? getSyncOverview(data.items) : null
  const isRunning = overview?.isRunning ?? false

  // 수집이 끝나면 아래 탭의 목록과 다른 화면의 데이터도 새로 받는다(내 계정과 수집 현황은 이미 최신이다)
  const wasRunning = useRef(false)
  useEffect(() => {
    if (wasRunning.current && !isRunning) {
      void queryClient.invalidateQueries({
        predicate: (query) => !isMeQuery(query) && query.queryKey[0] !== 'data-sync-runs',
      })
    }
    wasRunning.current = isRunning
  }, [isRunning, queryClient])

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
