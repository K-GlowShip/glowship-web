import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import { useSession } from '@/entities/session'
import { analysisRunQueries, delayEventQueries, isApiError, isRunInProgress } from '@/shared/api'
import { DELAY_EVENT_ID_PARAM, ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { QueryError } from '@/shared/ui/query-error'

import { getListSearch, toClientRole } from '../model/delay-center'
import { ANALYSIS_NOTICE } from '../model/delay-center-text'
import { toDelayCase } from '../model/to-delay-case'
import { useAnalysisPollLimit } from '../model/use-analysis-poll-limit'
import { DelayDetail } from './DelayDetail'
import { DelayDetailSkeleton } from './DelayDetailSkeleton'

const DELAY_EVENT_NOT_FOUND = 'DELAY_EVENT_NOT_FOUND'
/** 분석 중인 동안 결과가 나왔는지 확인하는 간격. 서버 분석은 수십 초 걸린다 */
const ANALYSIS_POLL_INTERVAL_MS = 3_000

/** 지연 건 하나의 상세 화면. 목록에서 들어왔으면 '목록으로'가 그 목록의 검색 조건을 되살린다. */
export function DelayDetailPage() {
  const delayEventId = useParams()[DELAY_EVENT_ID_PARAM] ?? ''
  const { state } = useLocation()
  const { me } = useSession()
  const listSearch = getListSearch(state)

  // 분석이 끝나기 전에는 결과가 나올 때까지 주기적으로 다시 읽는다(탭이 가려져 있으면 쉰다). 너무 오래 걸리면 멈추고 알린다.
  // 다시 읽을지는 조회 설정이 먼저 정해야 해서, 제한 시간이 지났는지는 아래에서 계산해 ref로 넘긴다
  const isTimedOutRef = useRef(false)
  const pollInterval = (isInProgress: boolean) =>
    isInProgress && !isTimedOutRef.current ? ANALYSIS_POLL_INTERVAL_MS : false
  const eventQuery = useQuery({
    ...delayEventQueries.detail(delayEventId),
    refetchInterval: ({ state }) => pollInterval(isRunInProgress(state.data?.runs[0]?.status)),
  })
  // 상세 응답의 `runs`는 최신 버전이 먼저다. 현재 실행의 결과는 실행 상세에서 읽는다
  const currentRunId = eventQuery.data?.runs[0]?.runId
  const runQuery = useQuery({
    ...analysisRunQueries.detail(currentRunId ?? ''),
    enabled: currentRunId !== undefined,
    refetchInterval: ({ state }) => pollInterval(isRunInProgress(state.data?.status)),
  })
  const isAnalyzing =
    isRunInProgress(runQuery.data?.status) || isRunInProgress(eventQuery.data?.runs[0]?.status)
  const pollLimit = useAnalysisPollLimit(isAnalyzing, currentRunId)
  useEffect(() => {
    isTimedOutRef.current = pollLimit.isTimedOut
  }, [pollLimit.isTimedOut])
  const retryPolling = () => {
    pollLimit.restart()
    void eventQuery.refetch()
    void runQuery.refetch()
  }
  const delayCase = eventQuery.data ? toDelayCase(eventQuery.data, runQuery.data ?? null) : null
  const failedQuery = [eventQuery, runQuery].find(({ error }) => error)
  const isNotFound = isApiError(eventQuery.error) && eventQuery.error.code === DELAY_EVENT_NOT_FOUND

  return (
    <div className="flex flex-col gap-16pxr">
      <Link
        to={{ pathname: ROUTES.DELAY_CENTER, search: listSearch }}
        className="flex w-fit items-center gap-4pxr rounded-card text-b1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
      >
        <ChevronLeft className="size-18pxr" aria-hidden="true" />
        목록으로
      </Link>

      {delayCase && pollLimit.isTimedOut && <SlowAnalysisNotice onRetry={retryPolling} />}

      {delayCase ? (
        <DelayDetail
          key={`${delayCase.id}:${delayCase.runId}:${delayCase.status}`}
          delayCase={delayCase}
          role={toClientRole(me?.roleCode)}
        />
      ) : isNotFound ? (
        <Notice>지연 건을 찾을 수 없습니다.</Notice>
      ) : failedQuery?.error ? (
        <QueryError
          message={failedQuery.error.message}
          loading={failedQuery.isFetching}
          onRetry={() => void failedQuery.refetch()}
        />
      ) : eventQuery.data && (currentRunId === undefined || runQuery.isFetched) ? (
        // 분석 실행이 없거나 서버가 모르는 상태를 주면 화면 상태를 정할 수 없다
        <Notice>분석 상태를 확인할 수 없습니다.</Notice>
      ) : (
        <DelayDetailSkeleton />
      )}
    </div>
  )
}

function Notice({ children }: { children: string }) {
  return (
    <p className="rounded-panel border border-border bg-card px-32pxr py-80pxr text-center text-b1 text-muted-foreground">
      {children}
    </p>
  )
}

/** 분석이 제한 시간 안에 끝나지 않아 다시 읽기를 멈췄을 때의 안내 */
function SlowAnalysisNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-16pxr rounded-card bg-warning-bg px-20pxr py-16pxr text-warning"
    >
      <div className="flex flex-col gap-4pxr">
        <p className="text-b1 font-bold">{ANALYSIS_NOTICE.SLOW_TITLE}</p>
        <p className="text-b2">{ANALYSIS_NOTICE.SLOW_DETAIL}</p>
      </div>
      <Button variant="secondary" size="sm" className="shrink-0" onClick={onRetry}>
        {ANALYSIS_NOTICE.SLOW_RETRY}
      </Button>
    </div>
  )
}
