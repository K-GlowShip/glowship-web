import { cn } from '@/shared/lib/cn'

interface TimelineTrackProps {
  dotClassName: string
  /** 이 점에서 다음 점까지 잇는 선의 색. 마지막 점이면 선이 없으므로 생략한다. */
  lineClassName?: string
}

/**
 * 타임라인의 점 하나와, 그 점에서 다음 점까지 이어지는 선.
 * 칸 사이에 간격 없이 붙여 놓으면 선이 칸 너비만큼 이어져서 점들이 하나의 흐름으로 보인다.
 */
export function TimelineTrack({ dotClassName, lineClassName }: TimelineTrackProps) {
  return (
    <span className="relative block h-10pxr" aria-hidden="true">
      {lineClassName && (
        <span
          className={cn('absolute top-1/2 left-0 h-2pxr w-full -translate-y-1/2', lineClassName)}
        />
      )}
      <span className={cn('absolute top-0 left-0 size-10pxr rounded-full', dotClassName)} />
    </span>
  )
}
