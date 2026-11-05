import { NEW_DELAY_FROM } from '@/entities/delay-event'
import { formatHHmm, formatKoreanLongDate } from '@/shared/lib/kst-date'

import {
  MOCK_DELAYS,
  MOCK_NEW_DELAY_ALERT_COUNT,
  MOCK_INVENTORY,
  MOCK_SUMMARY,
  MOCK_SYNC_STATUS,
} from '../model/dashboard-mock'
import { DelayAlertBanner } from './DelayAlertBanner'
import { DelayTable } from './DelayTable'
import { InboundTrendCard } from './InboundTrendCard'
import { InventoryTable } from './InventoryTable'
import { KpiCards } from './KpiCards'
import { SyncStatusCard } from './SyncStatusCard'

// 로그인 연동 전까지 Figma 예시 값을 사용한다 (AppGnb와 같은 값). 연동하면 GET /me로 바꾼다
const USER_NAME = '김민지'

// 간격은 두 단계로 맞춘다.
// 24px: 구획 사이(화면 세로, 카드 옆 카드)와 카드 안쪽 여백. 16px: 카드 제목 아래와 카드 안 블록 사이.
export function DashboardPage() {
  // TODO: 대시보드 API 연동 시 로딩·오류 상태와 함께 서버 응답으로 교체
  const summary = MOCK_SUMMARY
  const lastSyncedAt = summary.lastSyncedAt

  return (
    <div className="flex flex-col gap-24pxr">
      <header className="flex flex-wrap items-end justify-between gap-12pxr">
        <div>
          <h1 className="text-h1 font-bold">안녕하세요, {USER_NAME}님</h1>
          <p className="text-b1 text-muted-foreground">
            오늘의 물류 흐름과 확인이 필요한 변화를 살펴보세요.
          </p>
        </div>
        <div className="text-right text-b2 text-muted-foreground">
          <div>
            {lastSyncedAt ? (
              <>
                <p>{formatKoreanLongDate(lastSyncedAt)}</p>
                <p>마지막 업데이트 {formatHHmm(lastSyncedAt)} KST</p>
              </>
            ) : (
              <p>수집된 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </header>

      {/* TODO: 서버 연동 시 지연 목록의 첫 항목이 아니라 GET /delay-events를 from(최근 감지)·hasFinalDecision=false로 따로 조회한다 */}
      <DelayAlertBanner
        delay={MOCK_DELAYS.items[0]}
        totalCount={MOCK_NEW_DELAY_ALERT_COUNT}
        detectedFrom={NEW_DELAY_FROM}
      />
      <KpiCards summary={summary} />

      <DelayTable delays={MOCK_DELAYS} />

      <div className="grid items-start gap-24pxr xl:grid-cols-[minmax(0,1fr)_22rem]">
        <InboundTrendCard />
        <SyncStatusCard syncStatus={MOCK_SYNC_STATUS} referenceAt={lastSyncedAt} />
      </div>

      <InventoryTable inventory={MOCK_INVENTORY} />
    </div>
  )
}
