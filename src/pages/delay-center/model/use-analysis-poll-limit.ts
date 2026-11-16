import { useEffect, useState } from 'react'

/**
 * 분석이 이 시간 안에 끝나지 않으면 다시 읽기를 멈추고 알린다. 서버는 저장 재시도와 실패 기록까지 한 실행이 많게는 약 4분 걸리므로
 * 그보다 길게 잡는다. 앞의 분석 뒤에 줄을 서면 더 걸릴 수 있어서, 안내가 떠도 "다시 확인"으로 이어서 기다릴 수 있다.
 */
export const ANALYSIS_POLL_LIMIT_MS = 300_000

/**
 * 분석 중인 실행을 다시 읽는 것을 언제까지 할지 정한다. 분석이 시작되지 않은 채 멈추면(서버의 자동 분석이 꺼져 있는 경우 등)
 * 끝없이 요청하지 않도록 제한 시간이 지나면 `isTimedOut`이 되고, `restart`를 부르면 처음부터 다시 센다.
 * 다른 실행으로 바뀌면 시간을 다시 센다.
 */
export const useAnalysisPollLimit = (isInProgress: boolean, runId: string | undefined) => {
  const [attempt, setAttempt] = useState(0)
  const [expiredKey, setExpiredKey] = useState<string | null>(null)
  const key = `${runId}:${attempt}`

  useEffect(() => {
    if (!isInProgress) {
      return
    }
    const timer = setTimeout(() => setExpiredKey(key), ANALYSIS_POLL_LIMIT_MS)
    return () => clearTimeout(timer)
  }, [isInProgress, key])

  return {
    isTimedOut: isInProgress && expiredKey === key,
    restart: () => setAttempt((count) => count + 1),
  }
}
