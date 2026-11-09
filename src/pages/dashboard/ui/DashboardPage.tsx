import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/entities/session'
import { dashboardQueries } from '@/shared/api'
import { formatHHmm, formatKoreanLongDate } from '@/shared/lib/kst-date'

import { DelayAlertBanner } from './DelayAlertBanner'
import { DelayTable } from './DelayTable'
import { InboundTrendCard } from './InboundTrendCard'
import { InventoryTable } from './InventoryTable'
import { KpiCards } from './KpiCards'
import { SyncStatusCard } from './SyncStatusCard'

// 간격은 두 단계로 맞춘다.
// 24px: 구획 사이(화면 세로, 카드 옆 카드)와 카드 안쪽 여백. 16px: 카드 제목 아래와 카드 안 블록 사이.
export function DashboardPage() {
  const { me } = useSession()
  // 헤더의 기준 시각은 요약에서 받는다. KPI 카드를 포함한 나머지 영역은 각자 데이터를 받는다
  const { data: summary } = useQuery(dashboardQueries.summary())
  const lastSyncedAt = summary?.lastSyncedAt ?? null

  return (
    <div className="flex flex-col gap-24pxr">
      <header className="flex flex-wrap items-end justify-between gap-12pxr">
        <div>
          <h1 className="text-h1 font-bold">안녕하세요{me && `, ${me.displayName}님`}</h1>
          <p className="text-b1 text-muted-foreground">
            오늘의 물류 흐름과 확인이 필요한 변화를 살펴보세요.
          </p>
        </div>
        {summary && (
          <div className="text-right text-b2 text-muted-foreground">
            {lastSyncedAt ? (
              <>
                <p>{formatKoreanLongDate(lastSyncedAt)}</p>
                <p>마지막 업데이트 {formatHHmm(lastSyncedAt)} KST</p>
              </>
            ) : (
              <p>수집된 데이터가 없습니다.</p>
            )}
          </div>
        )}
      </header>

      <DelayAlertBanner referenceAt={lastSyncedAt} />
      <KpiCards />

      <DelayTable />

      <div className="grid gap-24pxr xl:grid-cols-[minmax(0,1fr)_22rem]">
        <InboundTrendCard />
        <SyncStatusCard referenceAt={lastSyncedAt} />
      </div>

      <InventoryTable />
    </div>
  )
}
