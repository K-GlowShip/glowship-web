import { cn } from '@/shared/lib/cn'

import {
  getStepAlign,
  STEP_ALIGN,
  toStepPosition,
  VOYAGE_IN_TRANSIT_STEP_INDEX,
  VOYAGE_STEPS,
  type StepAlign,
} from '../model/voyage'
import { getVoyageStyle } from './voyage-style'

// 양 끝 정거장은 아이콘 원(28px)의 바깥 가장자리에, 가운데 정거장은 원의 중심에 글자를 맞춘다
const STAGE_LABEL_ALIGN_CLASS: Record<StepAlign, string> = {
  [STEP_ALIGN.START]: '-translate-x-14pxr',
  [STEP_ALIGN.MIDDLE]: '-translate-x-1/2',
  [STEP_ALIGN.END]: '-translate-x-[calc(100%-0.875rem)]',
}

interface VoyageProgressProps {
  /** 현재 정거장의 순서. 서버가 새 운송 단계를 추가해 알 수 없으면 null이고 현재 단계 이름만 보여 준다 */
  stepIndex: number | null
  transportMode: string
  /** 정거장 이름. `VOYAGE_STEPS`와 같은 순서로 네 개다 */
  stepLabels: readonly string[]
  /** 현재 정거장에 적는 이름. 운송 단계 표시명이다 */
  currentLabel: string
}

/**
 * 선적이 여정의 어디에 있는지 보여 주는 선과 정거장 이름. 지나온 구간은 운송 수단의 색으로 채우고
 * 현재 정거장에 운송 수단 아이콘(해상은 배, 항공은 비행기)을 둔다. 운송 중에는 아이콘이 살짝 떠 있다.
 * 선이 짧으면 이름이 겹쳐서 현재 단계만 남긴다. 선의 아이콘과 색은 장식이고 같은 내용을 아래 글자가 말한다.
 */
export function VoyageProgress({
  stepIndex,
  transportMode,
  stepLabels,
  currentLabel,
}: VoyageProgressProps) {
  const voyageStyle = getVoyageStyle(transportMode)

  return (
    <div className="@container">
      {stepIndex !== null && <VoyageTrack stepIndex={stepIndex} transportMode={transportMode} />}
      {/* 정거장 이름을 선의 각 점 바로 아래에 둔다. 선과 같은 만큼 좌우를 들여 위치를 맞춘다 */}
      <div className="px-14pxr text-caption">
        <ol className="relative h-18pxr">
          {stepIndex === null ? (
            <li className={cn('absolute -translate-x-14pxr font-bold', voyageStyle.text)}>
              {currentLabel}
            </li>
          ) : (
            VOYAGE_STEPS.map(({ label }, index) => (
              <li
                key={label}
                aria-current={index === stepIndex ? 'step' : undefined}
                className={cn(
                  'absolute whitespace-nowrap',
                  STAGE_LABEL_ALIGN_CLASS[getStepAlign(index)],
                  index === stepIndex
                    ? cn('font-bold', voyageStyle.text)
                    : 'hidden text-disabled-foreground @xs:block',
                )}
                style={{ left: toStepPosition(index) }}
              >
                {index === stepIndex ? currentLabel : stepLabels[index]}
              </li>
            ))
          )}
        </ol>
      </div>
    </div>
  )
}

function VoyageTrack({ stepIndex, transportMode }: { stepIndex: number; transportMode: string }) {
  const { Icon, marker, fill, dot } = getVoyageStyle(transportMode)

  return (
    // 양 끝 정거장의 아이콘(28px)이 잘리지 않게 좌우를 반지름만큼 들인다. 눌리는 줄 안에 놓여도 클릭을 가로채지 않는다
    <div className="pointer-events-none px-14pxr py-4pxr" aria-hidden="true">
      <div className="relative h-28pxr">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-primary-200" />
        <span
          className={cn(
            'absolute top-1/2 left-0 h-2pxr origin-left -translate-y-1/2 animate-grow-x rounded-full bg-linear-to-r motion-reduce:animate-none',
            fill,
          )}
          style={{ width: toStepPosition(stepIndex) }}
        />
        {VOYAGE_STEPS.map(({ label }, index) => (
          <span
            key={label}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: toStepPosition(index) }}
          >
            {index === stepIndex ? (
              <span
                className={cn(
                  'flex size-28pxr items-center justify-center rounded-full text-white',
                  marker,
                  index === VOYAGE_IN_TRANSIT_STEP_INDEX &&
                    'animate-float motion-reduce:animate-none',
                )}
              >
                <Icon className="size-16pxr" />
              </span>
            ) : (
              <span
                className={cn(
                  'block size-8pxr rounded-full',
                  index < stepIndex ? dot : 'border-2 border-primary-200 bg-card',
                )}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
