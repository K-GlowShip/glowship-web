import { useQuery } from '@tanstack/react-query'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'

import {
  getSyncOverview,
  SYNC_CARDS,
  SYNC_LEVEL,
  SYNC_SOURCE_LABEL,
} from '@/entities/data-sync-run'
import { dataSyncRunQueries } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatHHmm, formatYYYYMMDD, formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

/** 기준 시각과 같은 날이면 시각만, 다른 날이면 날짜를 붙여서 어제 수집한 값이 오늘 시각처럼 읽히지 않게 한다 */
const formatFinishedAt = (finishedAt: string, referenceAt: string | null) =>
  referenceAt === null || formatYYYYMMDD(finishedAt) === formatYYYYMMDD(referenceAt)
    ? formatHHmm(finishedAt)
    : formatYYYYMMDDHHmm(finishedAt).slice('YYYY.'.length)

interface SyncStatusCardProps {
  /** 화면의 기준 시각(`lastSyncedAt`). 수집 시각이 이 날이 아니면 날짜를 함께 보여 준다 */
  referenceAt: string | null
}

export function SyncStatusCard({ referenceAt }: SyncStatusCardProps) {
  const { data, error, isFetching, refetch } = useQuery(dataSyncRunQueries.latest())

  // 서버는 원천 5종을 항상 내려준다. 시스템별 카드(ERP·WMS·TMS)로 묶어 계산한다.
  const overview = data ? getSyncOverview(data.items) : null
  const cards = overview?.cards ?? []
  // FR-003: 수집 오류로 필수 자료가 빠지면 이에 기대는 분석이 보류된다
  const hasProblem = cards.some(
    ({ level }) => level === SYNC_LEVEL.ERROR || level === SYNC_LEVEL.PARTIAL,
  )
  const syncIntervalMinutes = overview?.syncIntervalMinutes

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle as="h2">데이터 수집 상태</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isFetching ? '수집 상태를 불러오는 중' : '수집 상태 새로고침'}
          aria-busy={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw className={cn(isFetching && 'animate-spin motion-reduce:animate-none')} />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-16pxr pt-16pxr">
        {!data ? (
          error ? (
            <QueryError
              message={error.message}
              loading={isFetching}
              onRetry={() => void refetch()}
            />
          ) : (
            <div className="flex flex-col gap-16pxr">
              {SYNC_CARDS.map(({ system }) => (
                <Skeleton key={system} className="h-40pxr" />
              ))}
            </div>
          )
        ) : data.items.length === 0 ? (
          <p className="py-24pxr text-center text-muted-foreground">수집 내역이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-16pxr">
            {cards.map((card) => (
              <li key={card.system} className="flex items-center justify-between gap-12pxr">
                <div className="min-w-0">
                  <p className="text-b1 font-bold">
                    {card.name} · {card.sourceSystemName ?? card.system}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {card.lastSyncedAt
                      ? `마지막 수집 ${formatFinishedAt(card.lastSyncedAt, referenceAt)} KST`
                      : '수집 기록 없음'}
                    {card.openIssueCount > 0 && ` · 오류 항목 ${card.openIssueCount}건`}
                    {card.problemDomains.length > 0 &&
                      ` · 확인 필요: ${card.problemDomains.map((domain) => SYNC_SOURCE_LABEL[domain]).join(' · ')}`}
                  </p>
                </div>
                <Badge variant={card.badge.variant}>{card.badge.label}</Badge>
              </li>
            ))}
          </ul>
        )}
        {hasProblem && (
          <p className="flex gap-6pxr rounded-control bg-warning-bg p-12pxr text-caption text-warning">
            <TriangleAlert className="mt-2pxr size-14pxr shrink-0" aria-hidden="true" />
            수집 오류로 필요한 자료가 빠지면 해당 지연의 분석이 보류될 수 있습니다.
          </p>
        )}
        {/* 카드가 옆 카드에 맞춰 늘어나도 링크는 바닥에 둔다 */}
        <div className="mt-auto flex items-center justify-between gap-8pxr">
          <Link to={ROUTES.SYNC_DATA} className="text-b2 text-primary hover:underline">
            연동 데이터 확인하기 →
          </Link>
          {syncIntervalMinutes !== undefined && (
            <p className="text-caption text-muted-foreground">
              {syncIntervalMinutes}분마다 자동 수집
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
