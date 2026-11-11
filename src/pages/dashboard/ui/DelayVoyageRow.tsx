import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import {
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  formatRoute,
  getRegionLabel,
  getStageLabel,
  getVoyageStepIndex,
  splitRoute,
  toDelayStatus,
  TransportChip,
  VOYAGE_STEPS,
  VoyageProgress,
} from '@/entities/delay-event'
import type { DelayEventListItem } from '@/shared/api'
import { EMPTY_VALUE, delayCenterPath } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'

/** 지연 한 줄의 열 나눔. 넓은 화면에서는 선적 번호 열을 고정하고 남는 폭을 여정 선이 갖는다 */
const ROW_GRID_CLASS =
  'grid gap-x-24pxr px-24pxr lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_9rem_4.5rem_8.5rem] xl:gap-x-40pxr 2xl:grid-cols-[17.5rem_minmax(0,1fr)_9rem_4.5rem_8.5rem]'

/** 지연 한 건을 한 줄로 보여 준다. 줄 전체를 누르면 그 지연의 상세로 이동한다 */
export function DelayVoyageRow({ delay }: { delay: DelayEventListItem }) {
  const status = toDelayStatus(delay.currentRun?.status)
  const routeLabel = formatRoute(delay)
  const route = splitRoute(routeLabel)
  const stepIndex = getVoyageStepIndex(delay.stage)
  const warehouseLabel = `입고 창고 ${getRegionLabel(delay.warehouse.regionCode)}`

  return (
    <li
      className={cn(
        ROW_GRID_CLASS,
        'group relative items-center gap-y-12pxr py-16pxr transition-colors hover:bg-primary-50/50 has-[a:focus-visible]:bg-primary-50 has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-primary/30 has-[a:focus-visible]:ring-inset',
      )}
    >
      <div className="min-w-0">
        {/* 줄 전체가 이 링크의 누르는 영역이다 */}
        <Link
          to={delayCenterPath(delay.delayEventId)}
          className="text-b1 font-bold outline-none after:absolute after:inset-0"
        >
          {delay.shipment.shipmentCode}
        </Link>
        <p className="truncate text-b2 text-muted-foreground">
          {delay.representativeSku?.productName ?? EMPTY_VALUE}
          {delay.skuCount > 1 && ` 외 ${formatNumber(delay.skuCount - 1)}개`}
        </p>
      </div>

      <div className="min-w-0">
        <p className="flex justify-between gap-8pxr text-caption text-muted-foreground">
          {route ? (
            <>
              <span className="flex shrink-0 items-center gap-6pxr whitespace-nowrap">
                <TransportChip transportMode={delay.transportMode} />
                {route.origin}
              </span>
              <span className="truncate">
                {route.destination} · {warehouseLabel}
              </span>
            </>
          ) : (
            <>
              <span>{routeLabel}</span>
              <span>{warehouseLabel}</span>
            </>
          )}
        </p>
        <VoyageProgress
          stepIndex={stepIndex}
          transportMode={delay.transportMode}
          stepLabels={VOYAGE_STEPS.map(({ label }) => label)}
          currentLabel={getStageLabel(delay.stage)}
        />
      </div>

      <dl className="contents">
        <div>
          <dt className="text-caption text-muted-foreground">계획 → 예상 입고</dt>
          <dd className="flex flex-wrap items-center gap-x-8pxr whitespace-nowrap">
            {formatMMDD(delay.planned3plInboundDate)} → {formatMMDD(delay.expected3plInboundDate)}
            <span className="rounded-full bg-danger-bg px-8pxr text-caption font-bold text-danger">
              +{delay.delayDays}일
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">위험 주문</dt>
          <dd className="font-bold">
            {delay.atRiskOrderCount === null
              ? EMPTY_VALUE
              : `${formatNumber(delay.atRiskOrderCount)}건`}
          </dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-8pxr">
        {status ? (
          <Badge variant={DELAY_STATUS_BADGE_VARIANT[status]}>{DELAY_STATUS_LABEL[status]}</Badge>
        ) : (
          <span>{EMPTY_VALUE}</span>
        )}
        <ChevronRight
          className="size-16pxr text-muted-foreground group-hover:text-primary group-has-[a:focus-visible]:text-primary"
          aria-hidden="true"
        />
      </div>
    </li>
  )
}
