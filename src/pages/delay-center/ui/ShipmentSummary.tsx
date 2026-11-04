import { cn } from '@/shared/lib/cn'

import {
  type DelayCase,
  formatMonthDay,
  formatRoute,
  STAGE_FLOW,
  STAGE_LABEL,
} from '../model/delay-center'

interface ShipmentSummaryProps {
  delayCase: DelayCase
}

/**
 * 선적 하나의 경로·현재 운송 단계·일정. 같은 선적의 상품은 모두 같은 경로로 오므로 상품별이 아니라 선적 단위로 둔다.
 * 경로 부분(제목과 단계 표시)은 지도로 바꿀 자리다. 지도에는 출발·도착 좌표와 단계별 일정이 필요한데 API 명세에 아직 없다.
 */
export function ShipmentSummary({ delayCase }: ShipmentSummaryProps) {
  const { route, transportMode, stage, plannedInbound, expectedInbound, previousExpectedInbound } =
    delayCase
  const flow = STAGE_FLOW[transportMode]
  const currentIndex = flow.indexOf(stage)

  return (
    <section
      aria-labelledby="shipment-title"
      className="flex flex-col gap-20pxr rounded-card bg-background p-24pxr"
    >
      <h3 id="shipment-title" className="text-b1 font-bold">
        {formatRoute({ route, transportMode })}
      </h3>

      <ol className="grid grid-cols-2 gap-16pxr md:grid-cols-4">
        {flow.map((code, index) => (
          <li
            key={code}
            aria-current={index === currentIndex ? 'step' : undefined}
            className="flex flex-col gap-6pxr"
          >
            <span
              className={cn(
                'relative h-2pxr',
                index < currentIndex ? 'bg-muted-foreground' : 'bg-border',
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  'absolute -top-4pxr left-0 size-10pxr rounded-full',
                  getStepDotClass(index, currentIndex),
                )}
              />
            </span>
            <span
              className={cn(
                'pt-4pxr text-b2',
                index === currentIndex ? 'font-bold text-primary' : 'text-muted-foreground',
              )}
            >
              {STAGE_LABEL[code]}
            </span>
          </li>
        ))}
      </ol>

      <dl className="grid grid-cols-3 gap-16pxr border-t border-border pt-20pxr">
        <SummaryItem label="계획 입고" value={formatMonthDay(plannedInbound)} />
        <SummaryItem
          label="예상 입고"
          value={formatMonthDay(expectedInbound)}
          note={
            previousExpectedInbound ? `이전 ${formatMonthDay(previousExpectedInbound)}` : undefined
          }
        />
        <SummaryItem
          label="지연 일수"
          value={delayCase.delayDays > 0 ? `+${delayCase.delayDays}일` : '없음'}
          danger={delayCase.delayDays > 0}
        />
      </dl>
    </section>
  )
}

interface SummaryItemProps {
  label: string
  value: string
  note?: string
  danger?: boolean
}

function SummaryItem({ label, value, note, danger }: SummaryItemProps) {
  return (
    <div className="flex flex-col gap-4pxr">
      <dt className="text-b2 text-muted-foreground">{label}</dt>
      <dd className={cn('text-h2 font-bold', danger && 'text-danger')}>{value}</dd>
      {note && <dd className="text-caption text-muted-foreground">{note}</dd>}
    </div>
  )
}

/** 지난 단계는 회색, 현재 단계만 보라색, 남은 단계는 옅은 색으로 구분한다. */
const getStepDotClass = (index: number, currentIndex: number) => {
  if (index === currentIndex) {
    return 'bg-primary'
  }
  return index < currentIndex ? 'bg-muted-foreground' : 'bg-border'
}
