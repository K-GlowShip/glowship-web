import {
  SYNC_SOURCE_LABEL,
  type SyncCardSummary,
  type SyncOverview,
} from '@/entities/data-sync-run'
import { EMPTY_VALUE } from '@/shared/config'
import { formatNumber } from '@/shared/lib/format-number'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

interface SyncStatusPanelProps {
  overview: SyncOverview
}

const formatSyncedAt = (syncedAt: string | null) =>
  syncedAt ? `${formatYYYYMMDDHHmm(syncedAt)} KST` : EMPTY_VALUE

/**
 * 마지막 수집·동기화 버튼은 위쪽에 한 번만 두고, 연동 시스템(ERP·WMS·TMS)은 3열로 나란히 보여 준다.
 * 열마다 묶인 원천별 상태(주문 ● 정상, 상품 ● 정상)를 펼치지 않아도 바로 보이게 한다.
 */
export function SyncStatusPanel({ overview }: SyncStatusPanelProps) {
  const { cards, lastSyncedAt, isRunning } = overview

  return (
    <Card>
      <CardContent className="flex flex-col gap-20pxr">
        <div className="flex items-center justify-between gap-16pxr">
          <div>
            <p className="text-caption text-muted-foreground">마지막 수집</p>
            <p className="text-b1 font-bold">{formatSyncedAt(lastSyncedAt)}</p>
          </div>
          {/* TODO: 전체 동기화 API 연결(요청 본문·진행 중 재요청 응답은 서버와 확정 후). 누른 뒤 latest를 다시 조회한다 */}
          <Button variant="secondary" size="sm" disabled={isRunning} className="shrink-0">
            {isRunning ? '수집 중' : '동기화'}
          </Button>
        </div>
        <ul
          aria-label="연동 시스템별 수집 상태"
          className="grid gap-16pxr border-t border-border pt-20pxr md:grid-cols-3 md:gap-0 md:divide-x md:divide-border"
        >
          {cards.map((card) => (
            <SyncSystemColumn key={card.system} card={card} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function SyncSystemColumn({ card }: { card: SyncCardSummary }) {
  return (
    <li className="flex min-w-0 flex-col gap-12pxr border-t border-border pt-16pxr first:border-t-0 first:pt-0 md:border-t-0 md:px-24pxr md:pt-0 md:first:pl-0 md:last:pr-0">
      <div>
        <p className="text-b1 font-bold">{card.name}</p>
        <p className="text-b2 text-muted-foreground">{card.sourceSystemName ?? card.system}</p>
      </div>
      <ul aria-label={`${card.name} 원천별 상태`} className="flex flex-col gap-8pxr">
        {card.sources.map((source) => (
          <li key={source.domain} className="flex items-center justify-between gap-12pxr">
            <span className="text-b2 text-muted-foreground">
              {SYNC_SOURCE_LABEL[source.domain]}
            </span>
            <span className="flex items-center gap-8pxr">
              {source.openIssueCount > 0 && (
                <span className="text-caption text-muted-foreground">
                  오류 {formatNumber(source.openIssueCount)}건
                </span>
              )}
              <Badge variant={source.badge.variant}>{source.badge.label}</Badge>
            </span>
          </li>
        ))}
      </ul>
    </li>
  )
}
