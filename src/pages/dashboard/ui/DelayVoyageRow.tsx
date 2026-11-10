import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import {
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  formatRoute,
  getRegionLabel,
  getStageLabel,
  toDelayStatus,
  TRANSPORT_MODE_LABEL,
  type TransportMode,
} from '@/entities/delay-event'
import type { DelayEventListItem } from '@/shared/api'
import { EMPTY_VALUE, delayCenterPath } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'

import {
  getStepAlign,
  getVoyageStepIndex,
  splitRoute,
  STEP_ALIGN,
  toStepPosition,
  VOYAGE_IN_TRANSIT_STEP_INDEX,
  VOYAGE_STEPS,
  type StepAlign,
} from '../model/voyage'
import { getVoyageStyle } from './voyage-style'

/** 지연 한 줄의 열 나눔. 넓은 화면에서는 선적 번호 열을 고정하고 남는 폭을 여정 선이 갖는다 */
const ROW_GRID_CLASS =
  'grid gap-x-24pxr px-24pxr lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_9rem_4.5rem_8.5rem] xl:gap-x-40pxr 2xl:grid-cols-[17.5rem_minmax(0,1fr)_9rem_4.5rem_8.5rem]'

// 양 끝 정거장은 아이콘 원(28px)의 바깥 가장자리에, 가운데 정거장은 원의 중심에 글자를 맞춘다
const STAGE_LABEL_ALIGN_CLASS: Record<StepAlign, string> = {
  [STEP_ALIGN.START]: '-translate-x-14pxr',
  [STEP_ALIGN.MIDDLE]: '-translate-x-1/2',
  [STEP_ALIGN.END]: '-translate-x-[calc(100%-0.875rem)]',
}

/** 지연 한 건을 한 줄로 보여 준다. 줄 전체를 누르면 그 지연의 상세로 이동한다 */
export function DelayVoyageRow({ delay }: { delay: DelayEventListItem }) {
  const status = toDelayStatus(delay.currentRun?.status)
  const routeLabel = formatRoute(delay)
  const route = splitRoute(routeLabel)
  const stepIndex = getVoyageStepIndex(delay.stage)
  const voyageStyle = getVoyageStyle(delay.transportMode)
  const transportLabel = TRANSPORT_MODE_LABEL[delay.transportMode as TransportMode]
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

      <div className="@container min-w-0">
        <p className="flex justify-between gap-8pxr text-caption text-muted-foreground">
          {route ? (
            <>
              <span className="flex shrink-0 items-center gap-6pxr whitespace-nowrap">
                {transportLabel && (
                  <span className={cn('rounded-full px-8pxr font-bold', voyageStyle.chip)}>
                    {transportLabel}
                  </span>
                )}
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
        {stepIndex !== null && (
          <VoyageTrack stepIndex={stepIndex} transportMode={delay.transportMode} />
        )}
        {/*
          정거장 이름을 여정 선의 각 점 바로 아래에 둔다. 선과 같은 만큼 좌우를 들여 위치를 맞춘다.
          현재 정거장은 운송 단계 표시명을 굵게, 나머지는 흐리게 적는다. 선이 짧으면 글자가 겹쳐서 현재 단계만 남긴다
        */}
        <div className="px-14pxr text-caption">
          <ol className="relative h-18pxr">
            {stepIndex === null ? (
              <li className={cn('absolute -translate-x-14pxr font-bold', voyageStyle.text)}>
                {getStageLabel(delay.stage)}
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
                  {index === stepIndex ? getStageLabel(delay.stage) : label}
                </li>
              ))
            )}
          </ol>
        </div>
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

/**
 * 선적이 여정의 어디에 있는지 보여 주는 선. 지나온 구간은 채우고 현재 정거장에 운송 수단 아이콘을 둔다.
 * 같은 내용을 아래 글자(운송 단계)가 말하므로 장식으로 둔다.
 */
function VoyageTrack({ stepIndex, transportMode }: { stepIndex: number; transportMode: string }) {
  const { Icon, marker, fill, dot } = getVoyageStyle(transportMode)

  return (
    // 양 끝 정거장의 아이콘(28px)이 잘리지 않게 좌우를 반지름만큼 들인다
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
