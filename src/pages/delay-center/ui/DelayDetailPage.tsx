import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'

import { useSession } from '@/entities/session'
import { analysisRunQueries, delayEventQueries, isApiError } from '@/shared/api'
import { DELAY_EVENT_ID_PARAM, ROUTES } from '@/shared/config'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { getListSearch, toClientRole } from '../model/delay-center'
import { toDelayCase } from '../model/to-delay-case'
import { DelayDetail } from './DelayDetail'

const DELAY_EVENT_NOT_FOUND = 'DELAY_EVENT_NOT_FOUND'

/** 지연 건 하나의 상세 화면. 목록에서 들어왔으면 '목록으로'가 그 목록의 검색 조건을 되살린다. */
export function DelayDetailPage() {
  const delayEventId = useParams()[DELAY_EVENT_ID_PARAM] ?? ''
  const { state } = useLocation()
  const { me } = useSession()
  const listSearch = getListSearch(state)

  const eventQuery = useQuery(delayEventQueries.detail(delayEventId))
  // 상세 응답의 `runs`는 최신 버전이 먼저다. 현재 실행의 결과는 실행 상세에서 읽는다
  const currentRunId = eventQuery.data?.runs[0]?.runId
  const runQuery = useQuery({
    ...analysisRunQueries.detail(currentRunId ?? ''),
    enabled: currentRunId !== undefined,
  })
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

      {delayCase ? (
        <DelayDetail key={delayCase.id} delayCase={delayCase} role={toClientRole(me?.roleCode)} />
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
        <Skeleton className="h-480pxr rounded-panel" />
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
