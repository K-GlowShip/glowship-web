import { type SkuImpact } from '../model/delay-center'
import {
  type AxisShipment,
  buildAxisScale,
  buildAxisSummary,
  getInboundDelay,
  pickAxisRows,
} from '../model/impact-axis'
import { AxisInboundRow } from './AxisInboundRow'
import { AxisLegend } from './AxisLegend'
import { AxisStockRow } from './AxisStockRow'

interface ImpactAxisProps {
  /** 보여 줄 상품 순서대로. 예상 입고 전에 안전재고 아래로 내려가는 상품만 `MAX_AXIS_ROWS`개까지 그린다. */
  impacts: SkuImpact[]
  shipment: AxisShipment
}

/**
 * 한 선적의 일정판. 맨 위 줄이 선적(계획 입고 → 예상 입고)이고, 그 아래에 이 선적에 실린 상품의 재고 줄을
 * 들여쓰기와 연결선으로 매달아 "선적 하나 → 그 안의 SKU들"로 읽히게 한다. 모든 줄이 같은 날짜 축을 쓰고,
 * 계획·예상 입고일의 세로 점선이 줄들을 관통해서 어느 상품이 입고 전에 바닥나는지와 품절·지연 구간의 길이를 한눈에 비교한다.
 * 정확한 날짜는 아래 표에 있어서 상품 줄에는 날짜 글자를 달지 않는다. 운송 단계별 날짜는 API에 없어서 이 축에는 날짜만 놓는다.
 * 품절 구간은 명세 4.5 재고 영향의 정의에 기대고 있다: 계산 구간이 [분석 기준일, 예상 입고일)이라 품절은 입고일 전에 끝나고,
 * `stockoutDays`는 연속 일수가 아니라 구간 안 품절일의 총합이다. 이 정의가 바뀌면 띠와 목업을 함께 확인한다.
 * 어떤 상품을 그릴지, 날짜를 어느 위치에 놓을지는 `model/impact-axis`가 계산하고, 이 컴포넌트는 줄을 쌓기만 한다.
 */
export function ImpactAxis({ impacts, shipment }: ImpactAxisProps) {
  const { plannedInbound, expectedInbound } = shipment
  const rows = pickAxisRows(impacts, expectedInbound)

  if (rows.length === 0) {
    return (
      <p className="text-b2 text-muted-foreground">
        예상 입고 전에 안전재고 아래로 내려가는 상품이 없습니다. 상품별 영향은 아래 표에서
        확인하세요.
      </p>
    )
  }

  const { toPercent, ticks } = buildAxisScale(rows, plannedInbound, expectedInbound)
  const { isDelayed } = getInboundDelay(plannedInbound, expectedInbound)
  const guides = (isDelayed ? [plannedInbound, expectedInbound] : [expectedInbound]).map(toPercent)
  const summary = buildAxisSummary(rows, shipment)

  return (
    <div className="flex flex-col gap-12pxr [--axis-label:9rem] web:[--axis-label:14rem]">
      {/* 선적 줄과 상품 줄을 한 판으로 감싼다. 위계는 상자가 아니라 들여쓰기·연결선·굵기로 만든다 */}
      <div
        role="img"
        aria-label={`선적과 실린 상품의 일정: ${summary}`}
        className="rounded-card border border-border px-20pxr pt-16pxr pb-8pxr"
      >
        <AxisInboundRow shipment={shipment} ticks={ticks} toPercent={toPercent} guides={guides} />
        {rows.map((row, index) => (
          <AxisStockRow
            key={`${row.skuCode}-${row.region}`}
            impact={row}
            expectedInbound={expectedInbound}
            toPercent={toPercent}
            guides={guides}
            isLast={index === rows.length - 1}
          />
        ))}
      </div>
      <AxisLegend />
    </div>
  )
}
