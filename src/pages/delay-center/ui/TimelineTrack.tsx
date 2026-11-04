import { cn } from '@/shared/lib/cn'

interface TimelineTrackProps {
  dotClassName: string
  /** 이 점에서 다음 점까지 잇는 선의 색. 마지막 점이면 선이 없으므로 생략한다. */
  lineClassName?: string
  /** 마지막 점처럼 칸의 오른쪽 끝에 놓는다. 이때 선은 앞 점에서 이 점으로 들어오는 선이다. */
  alignEnd?: boolean
}

/**
 * 타임라인의 점 하나와, 그 점에서 다음 점까지 이어지는 선.
 * 칸 사이에 간격 없이 붙여 놓으면 선이 칸 너비만큼 이어져서 점들이 하나의 흐름으로 보인다.
 */
export function TimelineTrack({ dotClassName, lineClassName, alignEnd }: TimelineTrackProps) {
  return (
    <span className="relative block h-10pxr" aria-hidden="true">
      {lineClassName && (
        <span
          className={cn('absolute top-1/2 left-0 h-2pxr w-full -translate-y-1/2', lineClassName)}
        />
      )}
      <span
        className={cn(
          'absolute top-0 size-10pxr rounded-full',
          alignEnd ? 'right-0' : 'left-0',
          dotClassName,
        )}
      />
    </span>
  )
}
