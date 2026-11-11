import { cn } from '@/shared/lib/cn'

import { type DelayCase, STAGE_FLOW, STAGE_LABEL } from '../model/delay-center'
import { TimelineTrack } from './TimelineTrack'

interface StageTimelineProps {
  delayCase: Pick<DelayCase, 'transportMode' | 'stage'>
}

/**
 * 선적의 운송 단계 표시줄(출항 전 → … → 입고 완료). 현재 단계를 강조한다. 입고 날짜는 머리의 요약과 아래 날짜 축에 있어 여기에는 적지 않는다.
 * 마지막 칸은 내용 너비만큼만 차지하고 오른쪽 끝에 붙여, 입고 완료 점이 아래 날짜 축의 끝과 맞는다.
 * 운송 방식에 없는 단계가 오면(데이터 오류) 현재 위치를 알 수 없어서 그리지 않는다.
 */
export function StageTimeline({ delayCase }: StageTimelineProps) {
  const { transportMode, stage } = delayCase
  const flow = STAGE_FLOW[transportMode]
  const currentIndex = flow.indexOf(stage)
  const lastIndex = flow.length - 1

  if (currentIndex < 0) {
    return null
  }

  return (
    <ol className="grid grid-cols-[1fr_1fr_1fr_auto]">
      {flow.map((code, index) => (
        <li
          key={code}
          aria-current={index === currentIndex ? 'step' : undefined}
          className="flex flex-col gap-10pxr"
        >
          <TimelineTrack
            dotClassName={getStepDotClass(index, currentIndex)}
            lineClassName={getStepLineClass(index === lastIndex ? index - 1 : index, currentIndex)}
            alignEnd={index === lastIndex}
          />
          <div className={cn('flex flex-col pr-8pxr', index === lastIndex && 'items-end pr-0')}>
            <span
              className={cn(
                'text-b2',
                index === currentIndex ? 'font-bold text-primary' : 'text-muted-foreground',
              )}
            >
              {STAGE_LABEL[code]}
            </span>
            {index === currentIndex && index !== lastIndex && (
              <span className="text-caption text-primary">현재</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** 단계 index에서 다음 단계로 잇는 선. 현재 단계 앞까지만 진하게 칠한다. */
const getStepLineClass = (index: number, currentIndex: number) =>
  index < currentIndex ? 'bg-muted-foreground' : 'bg-border'

/** 지난 단계는 회색, 현재 단계만 보라색, 남은 단계는 옅은 색으로 구분한다. */
const getStepDotClass = (index: number, currentIndex: number) => {
  if (index === currentIndex) {
    return 'bg-primary'
  }
  return index < currentIndex ? 'bg-muted-foreground' : 'bg-border'
}
