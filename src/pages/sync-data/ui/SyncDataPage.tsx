import { useQuery } from '@tanstack/react-query'

import { dataSyncRunQueries } from '@/shared/api'
import { Skeleton } from '@/shared/ui/skeleton'

import { getSyncIntervalLabel, SYNC_CARD_DOMAINS, SYNC_CARD_NAME } from '../model/sync-sources'
import { SyncDataTabs } from './SyncDataTabs'
import { QueryError } from './QueryError'
import { SyncSourceCard } from './SyncSourceCard'

export function SyncDataPage() {
  const { data, error, isPending, isFetching, refetch } = useQuery(dataSyncRunQueries.latest())

  // 서버는 원천 5종을 항상 내려준다. 카드가 있는 원천만 순서대로 고른다.
  const runs = SYNC_CARD_DOMAINS.flatMap((domain) => {
    const run = data?.items.find((item) => item.sourceDomain === domain)
    return run ? [{ domain, run }] : []
  })

  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">연동 데이터 조회</h1>
        <p className="text-b1 text-muted-foreground">연동한 데이터를 조회해보세요</p>
      </header>

      <section className="flex flex-col gap-12pxr" aria-label="데이터 수집 현황">
        {runs[0] && (
          <p className="pr-12pxr text-right text-b2 text-muted-foreground">
            {getSyncIntervalLabel(runs[0].run.syncIntervalMinutes)}
          </p>
        )}
        {isPending && (
          <div className="grid gap-24pxr md:grid-cols-3">
            {SYNC_CARD_DOMAINS.map((domain) => (
              <Skeleton key={domain} className="h-148pxr rounded-card" />
            ))}
          </div>
        )}
        {error && !data && (
          <QueryError message={error.message} loading={isFetching} onRetry={() => void refetch()} />
        )}
        {data && (
          <div className="grid gap-24pxr md:grid-cols-3">
            {runs.map(({ domain, run }) => (
              <SyncSourceCard key={domain} name={SYNC_CARD_NAME[domain]} run={run} />
            ))}
          </div>
        )}
      </section>

      <SyncDataTabs />
    </div>
  )
}
