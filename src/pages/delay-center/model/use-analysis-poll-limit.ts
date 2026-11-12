import { useEffect, useState } from 'react'

/** 분석이 이 시간 안에 끝나지 않으면 다시 읽기를 멈추고 알린다. 서버의 분석 제한(120초)과 저장 제한을 합쳐도 넘지 않는 값이다 */
export const ANALYSIS_POLL_LIMIT_MS = 180_000

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
