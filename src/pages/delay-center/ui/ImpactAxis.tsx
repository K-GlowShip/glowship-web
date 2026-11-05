import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Tooltip } from '@/shared/ui/tooltip'

import { formatMonthDay, type SkuImpact } from '../model/delay-center'

/** 날짜 축에 상품별 줄로 그리는 최대 개수. 더 많으면 나머지는 아래 표에서 본다. */
export const MAX_AXIS_ROWS = 5

// TODO: 서버 연동 후 재고 영향 응답의 `safetyStockDays`로 바꾼다 (명세 4.5, 안전재고 기준 14일)
const SAFETY_STOCK_DAYS = 14
/** 날짜 눈금이 이 개수 안팎이 되도록 간격을 정한다 */
const TARGET_TICKS = 8

const DAY_MS = 86_400_000
const toDay = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS)
/** 하루 단위 번호를 'MM.DD'로 바꾼다 */
const formatDay = (day: number) =>
  new Date(day * DAY_MS).toISOString().slice(5, 10).replace('-', '.')

interface ImpactAxisProps {
  /** 보여 줄 상품 순서대로. 재고가 소진되는 상품만 `MAX_AXIS_ROWS`개까지 그린다. */
  impacts: SkuImpact[]
  plannedInbound: string
  expectedInbound: string
}

/**
 * 상품별 재고 일정과 선적의 입고 일정을 같은 날짜 축에 겹쳐 그린다. 상품마다 한 줄이고, 맨 아래 한 줄이 입고다.
 * 날짜에 비례해 위치를 잡고 계획·예상 입고일에 세로 점선을 내려서, 어느 상품이 입고 전에 바닥나는지와
 * 품절 구간·지연 구간의 길이를 한눈에 비교한다. 정확한 날짜는 아래 표에 있어서 상품 줄에는 날짜 글자를 달지 않는다.
 * 운송 단계별 날짜는 API에 없어서 이 축에는 단계가 아니라 날짜만 놓는다.
 * 품절 구간은 명세 4.5 재고 영향의 정의에 기대고 있다: 계산 구간이 [분석 기준일, 예상 입고일)이라 품절은 입고일 전에 끝나고,
 * `stockoutDays`는 연속 일수가 아니라 구간 안 품절일의 총합이다. 이 정의가 바뀌면 띠와 목업을 함께 확인한다.
 */
export function ImpactAxis({ impacts, plannedInbound, expectedInbound }: ImpactAxisProps) {
  // 입고 전에 재고가 소진되는 상품만 그린다. 안전재고만 내려가는 상품과 판정 불가 상품은 아래 상품별 표에서 본다.
  const stockoutRows = impacts.filter(({ estimable, stockoutDate }) => estimable && stockoutDate)
  const rows = stockoutRows.slice(0, MAX_AXIS_ROWS)
  const hiddenCount = impacts.length - rows.length

  if (rows.length === 0) {
    return (
      <p className="text-b2 text-muted-foreground">
        예상 입고 전에 재고가 소진되는 상품이 없습니다. 안전재고 아래로 내려가는 상품은 아래 표에서
        확인하세요.
      </p>
    )
  }
  const days = [
    toDay(plannedInbound),
    toDay(expectedInbound),
    ...rows.flatMap(({ safetyStockBreachDate, stockoutDate }) =>
      [safetyStockBreachDate, stockoutDate]
        .filter((date): date is string => date !== null)
        .map(toDay),
    ),
  ]
  const min = Math.min(...days)
  // 날짜가 하나뿐이어도 축이 0으로 나뉘지 않게 하루 폭을 준다
  const max = Math.max(Math.max(...days), min + 1)
  const toPercent = (date: string) => ((toDay(date) - min) / (max - min)) * 100

  const tickStep = Math.max(1, Math.ceil((max - min) / TARGET_TICKS))
  const ticks: number[] = []
  for (let day = min; day <= max; day += tickStep) {
    ticks.push(day)
  }

  const isDelayed = toDay(plannedInbound) < toDay(expectedInbound)
  const delayDays = toDay(expectedInbound) - toDay(plannedInbound)

  const summary = [
    ...rows.map((row) =>
      row.estimable
        ? `${row.productName}: ${[
            row.safetyStockBreachDate &&
              `${formatMonthDay(row.safetyStockBreachDate)} 안전재고 하회`,
            row.stockoutDate && `${formatMonthDay(row.stockoutDate)} 재고 소진`,
          ]
            .filter(Boolean)
            .join(', ')}`
        : `${row.productName}: 판정 불가`,
    ),
    `계획 입고 ${formatMonthDay(plannedInbound)}, 예상 입고 ${formatMonthDay(expectedInbound)}`,
  ].join(' / ')

  return (
    <div className="flex flex-col gap-12pxr [--axis-label:96px] lg:[--axis-label:224px]">
      <div role="img" aria-label={`재고와 입고 일정: ${summary}`} className="relative pr-40pxr">
        {/* 날짜 눈금 */}
        <div className="flex h-22pxr" aria-hidden="true">
          <div className="w-(--axis-label) shrink-0" />
          <div className="relative flex-1">
            {ticks.map((day, index) => (
              <span
                key={day}
                className={cn(
                  'absolute top-0 -translate-x-1/2 text-caption text-muted-foreground',
                  // 좁은 화면에서는 글자가 겹치지 않게 눈금을 하나 걸러서 보여 준다
                  index % 2 === 1 && 'max-lg:hidden',
                )}
                style={{ left: `${((day - min) / (max - min)) * 100}%` }}
              >
                {formatDay(day)}
              </span>
            ))}
          </div>
        </div>

        {/* 계획·예상 입고일에서 모든 상품 줄을 가로질러 입고 줄의 점까지 내려오는 점선 */}
        {/* 위는 눈금 줄 높이(22), 아래는 입고 줄 높이(76)에서 점의 위치(14)를 뺀 값(62)이다 */}
        <div
          className="pointer-events-none absolute top-22pxr right-40pxr bottom-62pxr left-(--axis-label)"
          aria-hidden="true"
        >
          {(isDelayed ? [plannedInbound, expectedInbound] : [expectedInbound]).map((date) => (
            <span
              key={date}
              className="absolute inset-y-0 border-l border-dashed border-border"
              style={{ left: `${toPercent(date)}%` }}
            />
          ))}
        </div>

        {rows.map((row) => (
          <StockRow
            key={`${row.skuCode}-${row.region}`}
            impact={row}
            toPercent={toPercent}
            expectedInbound={expectedInbound}
          />
        ))}

        {/* 입고 */}
        {/* 입고 줄은 점의 날짜와 이름을 선 아래에 적어서 상품 줄(32)보다 높다. 점은 줄 위에서 14 내려온 곳에 놓는다 */}
        <div className="flex h-76pxr" aria-hidden="true">
          <span className="flex w-(--axis-label) shrink-0 items-start pt-6pxr text-b2 font-bold">
            입고
          </span>
          <div className="relative flex-1">
            <span className="absolute inset-x-0 top-14pxr h-2pxr -translate-y-1/2 bg-border" />
            {isDelayed && (
              <span
                className="absolute top-14pxr flex h-18pxr -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-warning-bg px-16pxr text-caption font-bold whitespace-nowrap text-warning"
                style={{
                  left: `${toPercent(plannedInbound)}%`,
                  width: `${toPercent(expectedInbound) - toPercent(plannedInbound)}%`,
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

      <div className="flex flex-wrap items-center gap-x-16pxr gap-y-4pxr text-caption text-muted-foreground">
        <LegendDot
          className="bg-warning"
          label="안전재고 하회"
          description={`안전재고는 평균 일 판매량의 ${SAFETY_STOCK_DAYS}일분입니다.\n이 날 전까지는 안전재고가 남아 있고, 이 날부터는 여유 없이 재고가 줄어듭니다.`}
        />
        <LegendDot className="bg-danger" label="재고 소진" description="가용 재고가 0이 되는 날" />
        <LegendItem
          label="품절 구간"
          description="소진일부터 예상 입고 전까지의 구간. 그 사이 다른 선적이 입고되면 일부 날짜는 품절이 해소됩니다."
          mark={<span className="h-10pxr w-20pxr rounded-full bg-danger-bg" aria-hidden="true" />}
        />
        {hiddenCount > 0 && (
          <span className="ml-auto">그 밖의 {hiddenCount}개 상품은 아래 표에서 확인하세요.</span>
        )}
      </div>
    </div>
  )
}

interface LegendItemProps {
  label: string
  /** 마우스를 올리거나 포커스하면 보여 주는 설명 */
  description: string
  mark: ReactNode
}

/** 범례 한 칸. 이름에 점선 밑줄을 그어 설명이 있다는 걸 알리고, 이름을 올리면 뜻을 보여 준다. */
function LegendItem({ label, description, mark }: LegendItemProps) {
  return (
    <span className="flex items-center gap-6pxr">
      {mark}
      <Tooltip content={description}>
        <button
          type="button"
          className="cursor-help rounded-sm underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
        >
          {label}
        </button>
      </Tooltip>
    </span>
  )
}

function LegendDot({
  className,
  label,
  description,
}: {
  className: string
  label: string
  description: string
}) {
  return (
    <LegendItem
      label={label}
      description={description}
      mark={<span className={cn('size-10pxr rounded-full', className)} aria-hidden="true" />}
    />
  )
}

interface StockRowProps {
  impact: SkuImpact
  toPercent: (date: string) => number
  expectedInbound: string
}

/** 상품 하나의 재고 줄. 안전재고 하회와 재고 소진 점, 품절 구간 띠를 그린다. */
function StockRow({ impact, toPercent, expectedInbound }: StockRowProps) {
  const { productName, skuCode, safetyStockBreachDate, stockoutDate, stockoutDays } = impact
  // 품절 구간은 첫 품절일부터 예상 입고 전날까지다. 일수(stockoutDays)는 그 안 품절일의 총합이라,
  // 중간에 다른 입고가 있으면 구간보다 작다(명세 4.5 재고 영향)
  const spanDays = stockoutDate ? toDay(expectedInbound) - toDay(stockoutDate) : 0

  return (
    <div className="flex h-32pxr items-center" aria-hidden="true">
      {/* 좁은 화면에서는 이름이 잘려 상품을 구분할 수 없어서 짧은 상품 코드를 보여 준다 */}
      <span
        className="w-(--axis-label) shrink-0 truncate pr-12pxr text-b2 font-bold"
        title={`${productName} (${skuCode})`}
      >
        <span className="lg:hidden">{skuCode}</span>
        <span className="max-lg:hidden">{productName}</span>
      </span>
      <div className="relative h-full flex-1">
        <span className="absolute inset-x-0 top-1/2 h-2pxr -translate-y-1/2 bg-border" />
        {stockoutDate && !!stockoutDays && spanDays > 0 && (
          <span
            className="absolute top-1/2 h-14pxr -translate-y-1/2 rounded-full bg-danger-bg"
            style={{
              left: `${toPercent(stockoutDate)}%`,
              width: `${toPercent(expectedInbound) - toPercent(stockoutDate)}%`,
            }}
            title={
              stockoutDays < spanDays
                ? `품절 ${stockoutDays}일 (${formatMonthDay(stockoutDate)}부터 입고 전까지 ${spanDays}일 중)`
                : `품절 ${stockoutDays}일 (${formatMonthDay(stockoutDate)}부터)`
            }
          />
        )}
        {safetyStockBreachDate && (
          <Dot
            className="bg-warning"
            left={toPercent(safetyStockBreachDate)}
            title={`안전재고 하회 ${formatMonthDay(safetyStockBreachDate)}`}
          />
        )}
        {stockoutDate && (
          <Dot
            className="bg-danger"
            left={toPercent(stockoutDate)}
            title={`재고 소진 ${formatMonthDay(stockoutDate)}`}
          />
        )}
      </div>
    </div>
  )
}

function Dot({ className, left, title }: { className: string; left: number; title: string }) {
  return (
    <span
      className={cn(
        'absolute top-1/2 z-10 size-12pxr -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background',
        className,
      )}
      style={{ left: `${left}%` }}
      title={title}
    />
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
        className="absolute top-30pxr flex -translate-x-1/2 flex-col items-center text-center whitespace-nowrap"
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
