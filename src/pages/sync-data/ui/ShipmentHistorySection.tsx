import { useState } from 'react'

import type { ScheduleObservation } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import {
  formatSignedDays,
  getArrivalLegLabel,
  getShipmentStageLabel,
  toScheduleChanges,
} from '../model/shipment-detail'

/** 접힌 상태에서 보여 주는 관측 수. 최신 몇 건이면 지금 상태와 최근 변화가 보인다 */
const COLLAPSED_ROW_COUNT = 5

const CELL_CLASS = 'px-12pxr py-8pxr whitespace-nowrap'

interface ShipmentHistorySectionProps {
  history: ScheduleObservation[]
  /** 도착 구간 이름(항구/공항)과 단계 표시를 운송 수단에 맞춘다 */
  transportMode: string
  /** 표의 펼침 버튼이 가리키는 표 id */
  tableId: string
}

/**
 * 일정 변경 이력. 서버는 오래된 순으로 주지만 화면은 최신을 위에 두어, 지금 예상일과 직전 변화가 먼저 읽히게 한다.
 * 직전 관측에서 예상일이 움직였으면 날짜 옆에 며칠 늦춰졌는지(+)·당겨졌는지(-)를 적는다.
 * 관측이 많으면 최신 몇 건만 보이고 나머지는 펼친다.
 */
export function ShipmentHistorySection({
  history,
  transportMode,
  tableId,
}: ShipmentHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  // 변화 일수는 시간 흐름(오래된 순)으로 계산한 뒤 뒤집는다
  const changes = toScheduleChanges(history).reverse()
  const hiddenCount = changes.length - COLLAPSED_ROW_COUNT
  const visibleChanges =
    isExpanded || hiddenCount <= 0 ? changes : changes.slice(0, COLLAPSED_ROW_COUNT)

  return (
    <section className="flex flex-col gap-12pxr">
      <div className="flex items-baseline justify-between gap-12pxr">
        <h3 className="text-b1 font-bold">일정 변경 이력</h3>
        {history.length > 0 && (
          <p className="text-caption text-muted-foreground">
            관측 {formatNumber(history.length)}건 · 최신순
          </p>
        )}
      </div>

      {history.length === 0 ? (
        <p className="rounded-card border border-dashed border-border py-20pxr text-center text-b2 text-muted-foreground">
          기록된 일정 관측이 없습니다.
        </p>
      ) : (
        <>
          {/* 좁은 화면에서는 네 열을 한 줄에 담을 수 없어, 관측마다 카드로 쌓는다 */}
          <ul className="flex flex-col divide-y divide-border border-y border-border sm:hidden">
            {visibleChanges.map(
              ({ observation, portArrivalShiftDays, inboundShiftDays }, index) => (
                <li
                  key={`${observation.observedAt}-${index}`}
                  className="flex flex-col gap-8pxr py-12pxr"
                >
                  <p className="flex flex-wrap items-baseline gap-x-8pxr">
                    <time dateTime={observation.observedAt} className="font-medium tabular-nums">
                      {formatYYYYMMDDHHmm(observation.observedAt)}
                    </time>
                    <span className="text-caption text-muted-foreground">
                      {getShipmentStageLabel(observation.stage, transportMode)}
                    </span>
                  </p>
                  <dl className="flex flex-col gap-4pxr tabular-nums">
                    <div className="flex items-baseline gap-12pxr">
                      <dt className="w-96pxr shrink-0 text-caption text-muted-foreground">
                        예상 {getArrivalLegLabel(transportMode)}
                      </dt>
                      <dd>
                        <ShiftedDate
                          date={observation.expectedPortArrivalDate}
                          shift={portArrivalShiftDays}
                        />
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-12pxr">
                      <dt className="w-96pxr shrink-0 text-caption text-muted-foreground">
                        예상 3PL 입고
                      </dt>
                      <dd>
                        <ShiftedDate
                          date={observation.expected3plInboundDate}
                          shift={inboundShiftDays}
                        />
                      </dd>
                    </div>
                  </dl>
                </li>
              ),
            )}
          </ul>
          <Table id={tableId} density="compact" className="hidden sm:table">
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="w-150pxr py-10pxr">
                  관측 시각
                </TableHead>
                <TableHead scope="col" className="py-10pxr">
                  단계
                </TableHead>
                <TableHead scope="col" className="w-140pxr py-10pxr">
                  예상 {getArrivalLegLabel(transportMode)}
                </TableHead>
                <TableHead scope="col" className="w-140pxr py-10pxr">
                  예상 3PL 입고
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleChanges.map(
                ({ observation, portArrivalShiftDays, inboundShiftDays }, index) => (
                  <TableRow key={`${observation.observedAt}-${index}`}>
                    <TableCell className={cn(CELL_CLASS, 'tabular-nums')}>
                      <time dateTime={observation.observedAt}>
                        {formatYYYYMMDDHHmm(observation.observedAt)}
                      </time>
                    </TableCell>
                    <TableCell className={CELL_CLASS}>
                      {getShipmentStageLabel(observation.stage, transportMode)}
                    </TableCell>
                    <TableCell className={cn(CELL_CLASS, 'tabular-nums')}>
                      <ShiftedDate
                        date={observation.expectedPortArrivalDate}
                        shift={portArrivalShiftDays}
                      />
                    </TableCell>
                    <TableCell className={cn(CELL_CLASS, 'tabular-nums')}>
                      <ShiftedDate
                        date={observation.expected3plInboundDate}
                        shift={inboundShiftDays}
                      />
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
          {hiddenCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="self-start px-0"
              aria-expanded={isExpanded}
              aria-controls={tableId}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              {isExpanded
                ? `최신 ${COLLAPSED_ROW_COUNT}건만 보기`
                : `이전 관측 ${formatNumber(hiddenCount)}건 더 보기`}
            </Button>
          )}
        </>
      )}
    </section>
  )
}

/** 날짜와, 직전 관측 대비 움직인 일수. 늦춰지면 위험색, 당겨지면 성공색이고 글자(+·-)로도 구분된다 */
function ShiftedDate({ date, shift }: { date: string | null; shift: number | null }) {
  const shiftLabel = formatSignedDays(shift)

  return (
    <>
      {date ?? EMPTY_VALUE}
      {shiftLabel && shift !== null && (
        <span
          className={cn(
            'ml-6pxr text-caption font-bold',
            shift > 0 ? 'text-danger' : 'text-success',
          )}
        >
          {shiftLabel}
        </span>
      )}
    </>
  )
}
