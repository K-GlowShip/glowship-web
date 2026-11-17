import type { MutateOptions } from '@tanstack/react-query'
import { useRef } from 'react'

type Mutate<TData, TError, TVariables, TContext> = (
  variables: TVariables,
  options?: MutateOptions<TData, TError, TVariables, TContext>,
) => void

/**
 * 요청이 끝나기 전에 다시 부르면 무시하는 `mutate`.
 * `isPending`은 다음 렌더에야 바뀌어서, 같은 틱에 연달아 부르면(버튼을 빠르게 두 번 누름) 요청이 두 번 나간다.
 * 되돌릴 수 없는 생성 요청(계정 생성, 운영 기준 새 버전 저장)에 쓴다.
 */
export function useSingleFlightMutate<TData, TError, TVariables, TContext>(
  mutate: Mutate<TData, TError, TVariables, TContext>,
): Mutate<TData, TError, TVariables, TContext> {
  const isRequested = useRef(false)

  return (variables, options) => {
    if (isRequested.current) {
      return
    }
    isRequested.current = true
    mutate(variables, {
      ...options,
      onSettled: (...args) => {
        isRequested.current = false
        options?.onSettled?.(...args)
      },
    })
  }
}
