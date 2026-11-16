import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/avatar'

interface TimelineItemProps {
  /** 왼쪽 표식. 32px 원 자리에 놓이며, 세로 선은 그 가운데를 지난다 */
  marker: ReactNode
  children: ReactNode
  /** 마지막 항목은 아래로 이어지는 선이 없다 */
  isLast?: boolean
}

/** 판단 기록의 한 줄. 왼쪽에 표식을 두고, 마지막이 아니면 다음 항목으로 이어지는 세로 선을 그린다 */
export function TimelineItem({ marker, children, isLast = false }: TimelineItemProps) {
  return (
    <li
      className={cn(
        'relative flex gap-12pxr',
        !isLast &&
          'pb-24pxr after:absolute after:top-36pxr after:bottom-4pxr after:left-16pxr after:w-1pxr after:bg-border',
      )}
    >
      <div className="shrink-0">{marker}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}

/** 분석이 끝난 시점의 표식. 가장 조용한 속 빈 점 */
export function StartMarker() {
  return (
    <span className="grid size-32pxr place-items-center" aria-hidden="true">
      <span className="size-8pxr rounded-full border border-input bg-card" />
    </span>
  )
}

/** 팀원 아바타. 이름 첫 글자를 넣는다 */
export function PersonMarker({ name }: { name: string }) {
  return (
    <Avatar className="relative" aria-hidden="true">
      {Array.from(name)[0]}
    </Avatar>
  )
}

/** 최종 선택 표식. 도장처럼 찍히며 나타난다 */
export function FinalMarker() {
  return (
    <span
      className="relative grid size-32pxr animate-stamp place-items-center rounded-full bg-primary text-primary-foreground motion-reduce:animate-none"
      aria-hidden="true"
    >
      <Check className="size-16pxr" strokeWidth={2.5} />
    </span>
  )
}
