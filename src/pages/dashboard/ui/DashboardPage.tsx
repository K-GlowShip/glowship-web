import type { ReactNode } from 'react'

import { useQuery } from '@tanstack/react-query'

import { dashboardQueries } from '@/shared/api'

import { DashboardHero } from './DashboardHero'
import { DelayAlertBanner } from './DelayAlertBanner'
import { DelayVoyageCard } from './DelayVoyageCard'
import { InboundTrendCard } from './InboundTrendCard'
import { InventoryTable } from './InventoryTable'
import { SyncStatusCard } from './SyncStatusCard'

/** 구획이 떠오르는 간격 */
const RISE_STAGGER_MS = 80

// 간격은 두 단계로 맞춘다.
// 24px: 구획 사이(화면 세로, 카드 옆 카드)와 카드 안쪽 여백. 16px: 카드 제목 아래와 카드 안 블록 사이.
export function DashboardPage() {
  // 기준 시각은 요약에서 받는다. 요약(인사말·KPI)을 포함한 나머지 영역은 각자 데이터를 받는다
  const { data: summary } = useQuery(dashboardQueries.summary())
  const lastSyncedAt = summary?.lastSyncedAt ?? null

  return (
    <div className="flex flex-col gap-24pxr">
      <Rise order={0}>
        <DashboardHero />
      </Rise>

      <DelayAlertBanner referenceAt={lastSyncedAt} />

      <Rise order={1}>
        <DelayVoyageCard />
      </Rise>

      <Rise order={2}>
        <div className="grid gap-24pxr xl:grid-cols-[minmax(0,1fr)_22rem]">
          <InboundTrendCard />
          <SyncStatusCard referenceAt={lastSyncedAt} />
        </div>
      </Rise>

      <Rise order={3}>
        <InventoryTable />
      </Rise>
    </div>
  )
}

/** 구획이 위에서부터 차례로 떠오르게 한다. '동작 줄이기'를 켜면 바로 보인다 */
function Rise({ order, children }: { order: number; children: ReactNode }) {
  return (
    <div
      className="animate-rise motion-reduce:animate-none"
      style={{ animationDelay: `${order * RISE_STAGGER_MS}ms` }}
    >
      {children}
    </div>
  )
}
