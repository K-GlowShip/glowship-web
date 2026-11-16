import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { getNewestSyncedAt, getSyncOverview } from '@/entities/data-sync-run'
import { dataSyncRunQueries, isMeQuery } from '@/shared/api'

/** 수집이 도는 동안 현황을 다시 조회하는 간격. 적용은 요청 응답 뒤에 서버가 이어서 하므로 끝나는 때를 알아야 한다 */
const RUNNING_REFETCH_MS = 3000

/**
 * 수집 현황과 진행 감시. 수집이 도는 동안 현황을 주기적으로 다시 조회하고, 마지막 수집 완료 시각이 바뀌면 다른 화면의 데이터도
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

  // 수집이 끝났는지는 "수집 중이었다가 끝남"이 아니라 마지막 완료 시각이 바뀐 것으로 본다. 요청 직후 첫 조회에서
  // 이미 끝나 있으면 수집 중인 모습을 한 번도 못 보는데, 완료 시각은 그래도 바뀌어 있다. undefined는 아직 못 받았다는 뜻이다
  const syncedAt = data ? getNewestSyncedAt(data.items.map((item) => item.lastSyncedAt)) : undefined
  const seenSyncedAt = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (syncedAt === undefined) {
      return
    }
    if (seenSyncedAt.current !== undefined && seenSyncedAt.current !== syncedAt) {
      void queryClient.invalidateQueries({
        predicate: (query) => !isMeQuery(query) && query.queryKey[0] !== 'data-sync-runs',
      })
    }
    seenSyncedAt.current = syncedAt
  }, [syncedAt, queryClient])

  return { data, error, isPending, isFetching, refetch, overview, isRunning }
}
