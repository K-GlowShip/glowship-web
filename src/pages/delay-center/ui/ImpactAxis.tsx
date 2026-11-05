import { type SkuImpact } from '../model/delay-center'
import {
  buildAxisScale,
  buildAxisSummary,
  getInboundDelay,
  pickAxisRows,
} from '../model/impact-axis'
import { AxisInboundRow } from './AxisInboundRow'
import { AxisLegend } from './AxisLegend'
import { AxisStockRow } from './AxisStockRow'
import { AxisTicks } from './AxisTicks'

interface ImpactAxisProps {
  /** 보여 줄 상품 순서대로. 예상 입고 전에 안전재고 아래로 내려가는 상품만 `MAX_AXIS_ROWS`개까지 그린다. */
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
 * 어떤 상품을 그릴지, 날짜를 어느 위치에 놓을지는 `model/impact-axis`가 계산하고, 이 컴포넌트는 줄을 쌓기만 한다.
 */
export function ImpactAxis({ impacts, plannedInbound, expectedInbound }: ImpactAxisProps) {
  const { rows, hiddenCount } = pickAxisRows(impacts, expectedInbound)

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
  const summary = buildAxisSummary(rows, plannedInbound, expectedInbound)

  return (
    <div className="flex flex-col gap-12pxr [--axis-label:96px] lg:[--axis-label:224px]">
      <div role="img" aria-label={`재고와 입고 일정: ${summary}`} className="relative">
        <AxisTicks ticks={ticks} />
        {rows.map((row) => (
          <AxisStockRow
            key={`${row.skuCode}-${row.region}`}
            impact={row}
            expectedInbound={expectedInbound}
            toPercent={toPercent}
            guides={guides}
          />
        ))}
        <AxisInboundRow
          plannedInbound={plannedInbound}
          expectedInbound={expectedInbound}
          toPercent={toPercent}
          guides={guides}
        />
      </div>
      <AxisLegend hiddenCount={hiddenCount} />
    </div>
  )
}
