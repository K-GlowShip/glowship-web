import { TRANSPORT_MODE_LABEL } from '@/entities/delay-event'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD } from '@/shared/lib/kst-date'

import {
  type AxisShipment,
  type AxisTick,
  getAxisAlign,
  getInboundDelay,
} from '../model/impact-axis'
import { AxisGuides } from './AxisGuides'
import { AxisTicks } from './AxisTicks'

interface AxisInboundRowProps {
  shipment: AxisShipment
  ticks: AxisTick[]
  toPercent: (date: string) => number
  guides: number[]
}

/**
 * 일정판 맨 위의 선적 줄. 선적 코드·운송수단·상품 수를 눈금 위 한 줄에 판 폭 전체로 적어서 왼쪽 라벨 칸의 폭에
 * 매이지 않게 하고, 그 아래에 날짜 눈금과 입고 선을 둔다. 계획 입고(빈 점)와 예상 입고(채운 점)를 찍고,
 * 지연이면 둘 사이를 지연 띠로 잇는다. 점의 날짜와 이름을 선 아래에 적어서 상품 줄보다 높다.
 * 점은 눈금 아래 24px에 놓고, 점선도 거기까지만 내린다. 라벨 밑에서 줄 바닥까지 세로 연결선을 내려 상품 줄의 연결선과 이어지게 한다.
 */
export function AxisInboundRow({ shipment, ticks, toPercent, guides }: AxisInboundRowProps) {
  const { shipmentCode, transportMode, skuCount, plannedInbound, expectedInbound } = shipment
  const { isDelayed, delayDays } = getInboundDelay(plannedInbound, expectedInbound)

  return (
    <div className="flex flex-col" aria-hidden="true">
      <div className="flex h-22pxr items-baseline gap-8pxr">
        <span className="min-w-0 truncate text-b1 font-bold" title={shipmentCode}>
          {shipmentCode}
        </span>
        <span className="shrink-0 text-caption text-muted-foreground">
          {TRANSPORT_MODE_LABEL[transportMode]} · 상품 {formatNumber(skuCount)}종
        </span>
      </div>
      <div className="flex h-110pxr">
        {/* 라벨 밑에서 줄 바닥까지 내려가는 세로 연결선. 상품 줄의 연결선과 같은 자리(왼쪽 4px)에서 이어진다 */}
        <div className="w-(--axis-label) shrink-0 pt-8pxr pr-12pxr">
          <span className="ml-4pxr block h-full w-px bg-input" />
        </div>
        <div className="relative flex-1">
          <AxisTicks ticks={ticks} />
          <div className="relative h-88pxr">
            <AxisGuides guides={guides} className="bottom-auto h-24pxr" />
            <span className="absolute inset-x-0 top-24pxr h-2pxr -translate-y-1/2 bg-input" />
            {isDelayed && (
              <span
                className="absolute top-24pxr flex h-18pxr -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-warning-bg px-16pxr text-caption font-bold whitespace-nowrap text-warning"
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
            <InboundMarker
              date={expectedInbound}
              label="예상 입고"
              left={toPercent(expectedInbound)}
            />
          </div>
        </div>
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

/** 점 아래 글자의 정렬. 축 양 끝에서는 글자가 판 밖이나 왼쪽 라벨 칸으로 나가지 않게 안쪽으로 붙인다 */
const MARKER_ALIGN_CLASS = {
  start: 'translate-x-0 items-start text-left',
  center: '-translate-x-1/2 items-center text-center',
  end: '-translate-x-full items-end text-right',
} as const

/** 입고 선의 점과, 그 아래에 적는 날짜·이름 */
function InboundMarker({ date, label, left, hollow }: InboundMarkerProps) {
  return (
    <>
      <span
        className={cn(
          'absolute top-24pxr z-10 size-12pxr -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card',
          hollow ? 'border-2 border-muted-foreground bg-card' : 'bg-info',
        )}
        style={{ left: `${left}%` }}
      />
      <span
        className={cn(
          'absolute top-40pxr flex flex-col whitespace-nowrap',
          MARKER_ALIGN_CLASS[getAxisAlign(left)],
        )}
        style={{ left: `${left}%` }}
      >
        <span className={cn('text-b2 font-bold', hollow ? 'text-muted-foreground' : 'text-info')}>
          {formatMMDD(date)}
        </span>
        <span className="text-caption text-muted-foreground">{label}</span>
      </span>
    </>
  )
}
