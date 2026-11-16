import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { getSyncOverview } from '@/entities/data-sync-run'
import { dataSyncRunQueries, isMeQuery } from '@/shared/api'

/** 수집이 도는 동안 현황을 다시 조회하는 간격. 적용은 요청 응답 뒤에 서버가 이어서 하므로 끝나는 때를 알아야 한다 */
const RUNNING_REFETCH_MS = 3000

/**
 * 수집 현황과 진행 감시. 수집이 도는 동안 현황을 주기적으로 다시 조회하고, 수집이 끝나면 다른 화면의 데이터도
 * 새로 받는다(내 계정과 수집 현황은 이미 최신이다). 동기화 버튼이 있는 화면은 모두 이 훅으로 현황을 읽는다.
 */
export const useSyncProgress = () => {
  const queryClient = useQueryClient()
  const { data, error, isPending, isFetching, refetch } = useQuery({
    ...dataSyncRunQueries.latest(),
    refetchInterval: (query) => {
      const items = query.state.data?.items
      return items && getSyncOverview(items).isRunning ? RUNNING_REFETCH_MS : false
    },
  })

  // 서버는 원천 5종을 항상 내려준다. 시스템별 카드(ERP·WMS·TMS)로 묶어 계산한다.
  const overview = data ? getSyncOverview(data.items) : null
  const isRunning = overview?.isRunning ?? false

  const wasRunning = useRef(false)
  useEffect(() => {
    if (wasRunning.current && !isRunning) {
      void queryClient.invalidateQueries({
        predicate: (query) => !isMeQuery(query) && query.queryKey[0] !== 'data-sync-runs',
      })
    }
    wasRunning.current = isRunning
  }, [isRunning, queryClient])

  return { data, error, isPending, isFetching, refetch, overview, isRunning }
}
