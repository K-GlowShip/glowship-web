import type { ComponentProps } from 'react'

import { Input } from '@/shared/ui/input'

/** 일수 입력칸. 숫자를 오른쪽에 붙이고 단위 "일"을 칸 안에 보여 준다 */
export function DaysInput(props: Omit<ComponentProps<typeof Input>, 'type' | 'className'>) {
  return (
    <div className="relative w-104pxr">
      <Input
        {...props}
        inputMode="numeric"
        maxLength={4}
        className="pr-32pxr text-right tabular-nums"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-12pxr -translate-y-1/2 text-b2 text-muted-foreground"
      >
        일
      </span>
    </div>
  )
}
