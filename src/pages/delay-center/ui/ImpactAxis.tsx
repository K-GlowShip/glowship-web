import { cn } from '@/shared/lib/cn'

import { formatMonthDay, type SkuImpact } from '../model/delay-center'

/** 날짜 축에 상품별 줄로 그리는 최대 개수. 더 많으면 나머지는 아래 표에서 본다. */
export const MAX_AXIS_ROWS = 5

const ROW_HEIGHT = 32
const BAND_HEIGHT = 14
const DOT_SIZE = 10
const TICK_HEIGHT = 22
// 입고 줄은 점의 날짜와 이름을 선 아래에 적어서 상품 줄보다 높다
const INBOUND_Y = 14
const INBOUND_HEIGHT = 76
/** 날짜 눈금이 이 개수 안팎이 되도록 간격을 정한다 */
const TARGET_TICKS = 8

const DAY_MS = 86_400_000
const toDay = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS)
/** 하루 단위 번호를 'MM.DD'로 바꾼다 */
const formatDay = (day: number) =>
  new Date(day * DAY_MS).toISOString().slice(5, 10).replace('-', '.')

interface ImpactAxisProps {
  /** 보여 줄 상품 순서대로. `MAX_AXIS_ROWS`개까지만 그린다. */
  impacts: SkuImpact[]
  plannedInbound: string
  expectedInbound: string
}

/**
 * 상품별 재고 일정과 선적의 입고 일정을 같은 날짜 축에 겹쳐 그린다. 상품마다 한 줄이고, 맨 아래 한 줄이 입고다.
 * 날짜에 비례해 위치를 잡고 계획·예상 입고일에 세로 점선을 내려서, 어느 상품이 입고 전에 바닥나는지와
 * 품절 구간·지연 구간의 길이를 한눈에 비교한다. 정확한 날짜는 아래 표에 있어서 상품 줄에는 날짜 글자를 달지 않는다.
 * 운송 단계별 날짜는 API에 없어서 이 축에는 단계가 아니라 날짜만 놓는다.
 */
export function ImpactAxis({ impacts, plannedInbound, expectedInbound }: ImpactAxisProps) {
  const rows = impacts.slice(0, MAX_AXIS_ROWS)
  const hiddenCount = impacts.length - rows.length

  const estimableRows = rows.filter(({ estimable }) => estimable)
  const days = [
    toDay(plannedInbound),
    toDay(expectedInbound),
    ...estimableRows.flatMap(({ safetyStockBreachDate, stockoutDate, stockoutEndDate }) =>
      [safetyStockBreachDate, stockoutDate, stockoutEndDate]
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
        <div className="flex" style={{ height: TICK_HEIGHT }} aria-hidden="true">
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
        <div
          className="pointer-events-none absolute right-40pxr left-(--axis-label)"
          style={{ top: TICK_HEIGHT, bottom: INBOUND_HEIGHT - INBOUND_Y }}
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
          <StockRow key={`${row.skuCode}-${row.region}`} impact={row} toPercent={toPercent} />
        ))}

        {/* 입고 */}
        <div className="flex" style={{ height: INBOUND_HEIGHT }} aria-hidden="true">
          <span className="flex w-(--axis-label) shrink-0 items-start pt-6pxr text-b2 font-bold">
            입고
          </span>
          <div className="relative flex-1">
            <span
              className="absolute inset-x-0 h-2pxr -translate-y-1/2 bg-border"
              style={{ top: INBOUND_Y }}
            />
            {isDelayed && (
              <span
                className="absolute flex -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-warning-bg px-16pxr text-caption font-bold whitespace-nowrap text-warning"
                style={{
                  top: INBOUND_Y,
                  height: BAND_HEIGHT + 4,
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
        <LegendDot className="bg-warning" label="안전재고 하회" />
        <LegendDot className="bg-danger" label="재고 소진" />
        <span className="flex items-center gap-6pxr">
          <span className="h-10pxr w-20pxr rounded-full bg-danger-bg" aria-hidden="true" />
          품절 구간
        </span>
        {hiddenCount > 0 && (
          <span className="ml-auto">그 밖의 {hiddenCount}개 상품은 아래 표에서 확인하세요.</span>
        )}
      </div>
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-6pxr">
      <span className={cn('size-10pxr rounded-full', className)} aria-hidden="true" />
      {label}
    </span>
  )
}

interface StockRowProps {
  impact: SkuImpact
  toPercent: (date: string) => number
}

/** 상품 하나의 재고 줄. 안전재고 하회와 재고 소진 점, 품절 구간 띠를 그린다. */
function StockRow({ impact, toPercent }: StockRowProps) {
  const { productName, skuCode, estimable, safetyStockBreachDate, stockoutDate, stockoutEndDate } =
    impact

  return (
    <div className="flex items-center" style={{ height: ROW_HEIGHT }} aria-hidden="true">
      {/* 좁은 화면에서는 이름이 잘려 상품을 구분할 수 없어서 짧은 상품 코드를 보여 준다 */}
      <span
        className="w-(--axis-label) shrink-0 truncate pr-12pxr text-b2 font-bold"
        title={`${productName} (${skuCode})`}
      >
        <span className="lg:hidden">{skuCode}</span>
        <span className="max-lg:hidden">{productName}</span>
      </span>
      <div className="relative h-full flex-1">
        {estimable ? (
          <>
            <span className="absolute inset-x-0 top-1/2 h-2pxr -translate-y-1/2 bg-border" />
            {stockoutDate && stockoutEndDate && (
              <span
                className="absolute top-1/2 -translate-y-1/2 rounded-full bg-danger-bg"
                style={{
                  height: BAND_HEIGHT,
                  left: `${toPercent(stockoutDate)}%`,
                  width: `${toPercent(stockoutEndDate) - toPercent(stockoutDate)}%`,
                }}
                title={`품절 ${formatMonthDay(stockoutDate)}–${stockoutEndDate.slice(8)}`}
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
          </>
        ) : (
          <span className="absolute inset-y-0 left-0 flex items-center text-caption text-warning">
            판정 불가
          </span>
        )}
      </div>
    </div>
  )
}

function Dot({ className, left, title }: { className: string; left: number; title: string }) {
  return (
    <span
      className={cn(
        'absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background',
        className,
      )}
      style={{ left: `${left}%`, width: DOT_SIZE + 2, height: DOT_SIZE + 2 }}
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
          'absolute z-10 size-12pxr -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background',
          hollow ? 'border-2 border-muted-foreground bg-card' : 'bg-info',
        )}
        style={{ left: `${left}%`, top: INBOUND_Y }}
      />
      <span
        className="absolute flex -translate-x-1/2 flex-col items-center text-center whitespace-nowrap"
        style={{ left: `${left}%`, top: INBOUND_Y + 16 }}
      >
        <span className={cn('text-b2 font-bold', hollow ? 'text-muted-foreground' : 'text-info')}>
          {formatMonthDay(date)}
        </span>
        <span className="text-caption text-muted-foreground">{label}</span>
      </span>
    </>
  )
}
