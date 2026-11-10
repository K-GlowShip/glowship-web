import { useEffect, useRef, useState } from 'react'

import { prefersReducedMotion } from '@/shared/lib/reduced-motion'

const DURATION_MS = 900

interface CountUpProps {
  value: number
  /** 올라가는 중간값을 화면 문자열로 바꾼다. 중간값은 소수이므로 자릿수를 여기서 맞춘다 */
  format: (value: number) => string
}

/**
 * 숫자가 이전 값에서 새 값까지 올라가며 바뀐다. 처음에는 0에서 시작한다.
 * '동작 줄이기'를 켠 사용자에게는 바로 최종 값을 보여 준다.
 */
export function CountUp({ value, format }: CountUpProps) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0))
  const displayRef = useRef(display)

  useEffect(() => {
    const from = displayRef.current
    if (from === value) {
      return
    }
    const duration = prefersReducedMotion() ? 0 : DURATION_MS
    const startedAt = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const progress = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1)
      // 끝으로 갈수록 느려진다(ease-out cubic)
      const next = from + (value - from) * (1 - (1 - progress) ** 3)
      displayRef.current = next
      setDisplay(next)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{format(display)}</>
}
