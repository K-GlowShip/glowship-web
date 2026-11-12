import { useMutation } from '@tanstack/react-query'

import { type ApiError, isUnauthorizedError, requestReanalysis } from '@/shared/api'
import { toastError } from '@/shared/ui/toast'

import { useRefreshDelay } from './use-refresh-delay'

const HTTP_CONFLICT = 409

/**
 * 재분석 요청(`POST /analysis-runs/{runId}/reanalysis`). `runId`는 현재 실행이어야 한다.
 * 요청이 받아들여지면 새 실행이 `DETECTED`로 만들어지고 분석은 서버에서 이어서 돈다. 화면은 새 실행을 읽어 분석 중으로 바뀐다.
 * 409(이미 진행 중·현재 실행이 아님·이미 선택됨 등)는 화면이 오래된 것이라 실패해도 다시 읽고, 이유를 알린다.
 * 다시 읽기가 끝날 때까지 요청이 진행 중으로 남아, 버튼이 사라지기 전에 눌러 두 번 요청하지 않는다.
 */
export const useReanalysis = (runId: string) => {
  const refresh = useRefreshDelay()

  return useMutation({
    mutationFn: () => requestReanalysis(runId),
    onSuccess: refresh,
    onError: (error: ApiError) => {
      toastError(error.message)
      // 세션이 끝난 오류(401)는 전역 처리가 로그인 페이지로 보낸다
      if (!isUnauthorizedError(error) && error.status === HTTP_CONFLICT) {
        return refresh()
      }
    },
  })
}
