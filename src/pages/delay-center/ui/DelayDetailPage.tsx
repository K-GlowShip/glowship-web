import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import { useSession } from '@/entities/session'
import { analysisRunQueries, delayEventQueries, isApiError, isRunInProgress } from '@/shared/api'
import { DELAY_EVENT_ID_PARAM, ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { QueryError } from '@/shared/ui/query-error'
import { DetailPageSkeleton } from '@/shared/ui/skeleton'

import { getListSearch, toClientRole } from '../model/delay-center'
import { getAnalysisPollInterval } from '../model/analysis-poll-interval'
import { ANALYSIS_NOTICE } from '../model/delay-center-text'
import { toDelayCase } from '../model/to-delay-case'
import { useAnalysisPollLimit } from '../model/use-analysis-poll-limit'
import { DelayDetail } from './DelayDetail'

const DELAY_EVENT_NOT_FOUND = 'DELAY_EVENT_NOT_FOUND'

/** 지연 건 하나의 상세 화면. 목록에서 들어왔으면 '목록으로'가 그 목록의 검색 조건을 되살린다. */
export function DelayDetailPage() {
  const delayEventId = useParams()[DELAY_EVENT_ID_PARAM] ?? ''
  const { state } = useLocation()
  const { me } = useSession()
  const listSearch = getListSearch(state)

  // 분석이 끝나기 전에는 결과가 나올 때까지 주기적으로 다시 읽는다(탭이 가려져 있으면 쉰다). 너무 오래 걸리면 멈추고 알린다.
  // 다시 읽을지는 조회 설정이 먼저 정해야 해서, 제한 시간이 지났는지와 기다리기 시작한 시각은 아래에서 계산해 ref로 넘긴다.
  // 설정 쪽 함수는 이 ref를 읽기만 한다
  const isTimedOutRef = useRef(false)
  // 이 실행을 기다리기 시작한 시각. 오래 걸릴수록 읽는 간격을 늘린다
  const pollStartRef = useRef<number | null>(null)
  const pollInterval = (isInProgress: boolean) =>
    !isInProgress || isTimedOutRef.current
      ? false
      : getAnalysisPollInterval(
          pollStartRef.current === null ? 0 : Date.now() - pollStartRef.current,
        )
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

  useEffect(() => {
    pollStartRef.current = isAnalyzing ? Date.now() : null
  }, [isAnalyzing, currentRunId])

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
      {/* 모바일에서는 스크롤을 내려도 목록으로 돌아갈 수 있게 위에 붙여 둔다(스크롤 영역의 안쪽 여백 16px만큼 위로 올려 맨 위에 맞닿게 한다). 웹은 내용 위에 그대로 둔다. 날짜 축의 점(z-10)보다 위에 오도록 z-20이다 */}
      <div className="sticky -top-16pxr z-20 -mx-16pxr -mt-16pxr bg-background px-16pxr pt-16pxr pb-8pxr lg:static lg:m-0 lg:bg-transparent lg:p-0">
        <Link
          to={{ pathname: ROUTES.DELAY_CENTER, search: listSearch }}
          className="flex w-fit items-center gap-4pxr rounded-card text-b1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
        >
          <ChevronLeft className="size-18pxr" aria-hidden="true" />
          목록으로
        </Link>
      </div>

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
        <DetailPageSkeleton />
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
