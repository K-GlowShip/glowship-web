import { cn } from '@/shared/lib/cn'

import { formatMonthDay } from '../model/delay-center'
import { getInboundDelay, isAxisEnd } from '../model/impact-axis'
import { AxisGuides } from './AxisGuides'

interface AxisInboundRowProps {
  plannedInbound: string
  expectedInbound: string
  toPercent: (date: string) => number
  guides: number[]
}

/**
 * 맨 아래 입고 줄. 계획 입고(빈 점)와 예상 입고(채운 점)를 찍고, 지연이면 둘 사이를 지연 띠로 잇는다.
 * 점의 날짜와 이름을 선 아래에 적어서 상품 줄보다 높다. 점은 줄 위에서 14px 내려온 곳에 놓고, 점선도 거기까지만 내린다.
 */
export function AxisInboundRow({
  plannedInbound,
  expectedInbound,
  toPercent,
  guides,
}: AxisInboundRowProps) {
  const { isDelayed, delayDays } = getInboundDelay(plannedInbound, expectedInbound)

  return (
    <div className="flex h-76pxr" aria-hidden="true">
      <span className="flex w-(--axis-label) shrink-0 items-start pt-6pxr text-b2 font-bold">
        입고
      </span>
      <div className="relative flex-1">
        <AxisGuides guides={guides} className="bottom-auto h-14pxr" />
        <span className="absolute inset-x-0 top-14pxr h-2pxr -translate-y-1/2 bg-border" />
        {isDelayed && (
          <span
            className="absolute top-14pxr flex h-18pxr -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-warning-bg px-16pxr text-caption font-bold whitespace-nowrap text-warning"
            // 띠 끝이 둥글어서 점 중심까지만 그리면 점 앞에서 끊겨 보인다. 끝 반원(높이 18px의 절반 = 9px = 0.5625rem)만큼 더 늘려 점 안으로 넣는다
            style={{
              left: `${toPercent(plannedInbound)}%`,
              width: `calc(${toPercent(expectedInbound) - toPercent(plannedInbound)}% + 0.5625rem)`,
            }}
          >
            +{delayDays}일 지연
          </span>
        )}
        {isDelayed && (
          <InboundMarker
            date={plannedInbound}
            label="계획 입고"
            left={toPercent(plannedInbound)}
            hollow
          />
        )}
        <InboundMarker date={expectedInbound} label="예상 입고" left={toPercent(expectedInbound)} />
      </div>
    </div>
  )
}

interface InboundMarkerProps {
  date: string
  label: string
  left: number
  hollow?: boolean
}

/** 입고 줄의 점과, 그 아래에 적는 날짜·이름 */
function InboundMarker({ date, label, left, hollow }: InboundMarkerProps) {
  return (
    <>
      <span
        className={cn(
          'absolute top-14pxr z-10 size-12pxr -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background',
          hollow ? 'border-2 border-muted-foreground bg-card' : 'bg-info',
        )}
        style={{ left: `${left}%` }}
      />
      <span
        className={cn(
          'absolute top-30pxr flex flex-col whitespace-nowrap',
          isAxisEnd(left)
            ? '-translate-x-full items-end text-right'
            : '-translate-x-1/2 items-center text-center',
        )}
        style={{ left: `${left}%` }}
      >
        <span className={cn('text-b2 font-bold', hollow ? 'text-muted-foreground' : 'text-info')}>
          {formatMonthDay(date)}
        </span>
        <span className="text-caption text-muted-foreground">{label}</span>
      </span>
    </>
  )
}
