import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dataSyncRunQueries, isApiError, startDataSyncRun } from '@/shared/api'
import { toastError } from '@/shared/ui/toast'

const SYNC_IN_PROGRESS = 'SYNC_IN_PROGRESS'

/**
 * 동기화 버튼의 요청. 요청을 받으면 바로 수집 현황을 다시 조회해 "수집 중"으로 바꾼다.
 * 이미 수집 중이라 거절당해도(409) 현황이 오래된 것이니 다시 조회하고, 그 밖의 오류는 안내만 한다.
 */
export const useSyncData = () => {
  const queryClient = useQueryClient()
  const refreshLatest = () =>
    queryClient.invalidateQueries({ queryKey: dataSyncRunQueries.latest().queryKey })

  return useMutation({
    mutationFn: startDataSyncRun,
    onSuccess: refreshLatest,
    onError: (error) => {
      if (isApiError(error) && error.code === SYNC_IN_PROGRESS) {
        void refreshLatest()
      }
      toastError(error.message)
    },
  })
}
