import { useQueryClient } from '@tanstack/react-query'

import { analysisRunQueries, decisionQueries, delayEventQueries } from '@/shared/api'

/**
 * 판단·재분석처럼 서버 상태를 바꾼 뒤 화면이 서버를 따라가게 한다. 상세의 의견·선택 결과·현재 실행,
 * 목록의 상태·건수, 이력을 다시 읽는다. 돌려주는 약속은 다시 읽기가 끝나면 풀린다.
 */
export const useRefreshDelay = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [analysisRunQueries.all, delayEventQueries.all, decisionQueries.all].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    )
}
