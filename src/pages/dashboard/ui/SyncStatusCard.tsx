import { RefreshCw, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

import {
  SYNC_STATUS,
  SYNC_STATUS_BADGE_VARIANT,
  SYNC_STATUS_LABEL,
  type SyncStatusResult,
} from '../model/dashboard'

// TODO: 서버 연동 후에는 GET /data-sync-runs/latest를 다시 조회하고 끝나면 멈춘다. 지금은 동작만 보여 주는 시간이다
const MOCK_REFRESH_MS = 1000

export function SyncStatusCard({ syncStatus }: { syncStatus: SyncStatusResult }) {
  const { sources, syncIntervalMinutes } = syncStatus
  const [isRefreshing, setIsRefreshing] = useState(false)
  const timerRef = useRef<number>(undefined)

  // 화면을 벗어나면 대기 중인 타이머를 정리한다
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const handleRefresh = () => {
    if (isRefreshing) {
      return
    }
    setIsRefreshing(true)
    timerRef.current = window.setTimeout(() => setIsRefreshing(false), MOCK_REFRESH_MS)
  }
  // FR-003: 수집 오류로 필수 자료가 빠지면 이에 기대는 분석이 보류된다
  const hasProblem = sources.some(
    ({ status }) => status === SYNC_STATUS.FAILED || status === SYNC_STATUS.PARTIAL_SUCCESS,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">데이터 수집 상태</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isRefreshing ? '수집 상태를 불러오는 중' : '수집 상태 새로고침'}
          aria-busy={isRefreshing}
          onClick={handleRefresh}
        >
          <RefreshCw className={cn(isRefreshing && 'animate-spin motion-reduce:animate-none')} />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-16pxr">
        {sources.length === 0 ? (
          <p className="py-24pxr text-center text-muted-foreground">수집 내역이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-16pxr">
            {sources.map((source) => (
              <li key={source.sourceDomain} className="flex items-center justify-between gap-12pxr">
                <div className="min-w-0">
                  <p className="text-b1 font-bold">
                    {source.name} · {source.sourceSystemName}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {source.finishedAt
                      ? `마지막 수집 ${formatHHmm(source.finishedAt)} KST`
                      : '수집 기록 없음'}
                    {source.openIssueCount > 0 && ` · 오류 항목 ${source.openIssueCount}건`}
                  </p>
                </div>
                <Badge variant={SYNC_STATUS_BADGE_VARIANT[source.status]}>
                  {SYNC_STATUS_LABEL[source.status]}
                </Badge>
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
        <div className="flex items-center justify-between gap-8pxr">
          <Link to={ROUTES.SYNC_DATA} className="text-b2 text-primary hover:underline">
            연동 데이터 확인하기 →
          </Link>
          <p className="text-caption text-muted-foreground">
            {syncIntervalMinutes}분마다 자동 수집
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
