import { ChevronDown } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format-number'
import { getReasonLabel } from '@/entities/delay-event'
import { formatMMDD } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'

import { DetailSubsection } from './DetailChapter'
import {
  ATTRIBUTION_LABEL,
  countRiskOrdersByAttribution,
  type DelayOption,
  getOrderResult,
  ORDER_OUTCOME,
  OPTION_TYPE_LABEL,
  RISK_ATTRIBUTION,
  type RiskOrder,
  sortRiskOrders,
} from '../model/delay-center'

interface AtRiskOrdersProps {
  orders: RiskOrder[]
  /** 주문별 결과를 보여 줄 대응안. 없거나 주문별 결과가 없으면 대응 전 모습(약속 → 예상)만 보여 준다. */
  option?: DelayOption
}

/**
 * 위험 주문은 하나도 숨기지 않고 모두 보여 준다. 주문 단위로 묶고, 품목(상세)은 펼쳐서 본다.
 * 급한 순서(지연 유발 먼저, 약속일 빠른 순)로 정렬하고, 위에 귀속별 건수를 요약한다.
 * 영역 높이를 제한해서 주문이 많아도 상세 전체가 길어지지 않는다.
 */
export function AtRiskOrders({ orders, option }: AtRiskOrdersProps) {
  if (orders.length === 0) {
    return null
  }

  const { delayInduced, preExisting } = countRiskOrdersByAttribution(orders)
  const summary = [
    delayInduced > 0 && `${ATTRIBUTION_LABEL[RISK_ATTRIBUTION.DELAY_INDUCED]} ${delayInduced}건`,
    preExisting > 0 && `${ATTRIBUTION_LABEL[RISK_ATTRIBUTION.PRE_EXISTING]} ${preExisting}건`,
    '약속일 빠른 순',
    option && option.outcomes.length > 0 && `${OPTION_TYPE_LABEL[option.type]} 기준 결과`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <DetailSubsection
      id="risk-orders-title"
      title={
        <>
          위험 주문 <span className="text-muted-foreground">{orders.length}</span>
        </>
      }
      aside={summary}
    >
      {/* 주문이 많아도 상세가 길어지지 않게 영역 높이를 제한하고, 넘치면 이 안에서만 스크롤한다. 상자를 겹치지 않고 위아래 선과 줄 사이 선으로만 나눈다 */}
      <div className="border-t border-border">
        <div className="max-h-360pxr scrollbar-thin [scrollbar-color:color-mix(in_srgb,var(--color-muted-foreground)_40%,transparent)_transparent] overflow-y-auto">
          <ul className="flex flex-col">
            {sortRiskOrders(orders).map((order) => (
              <li key={order.orderCode} className="border-b border-border last:border-b-0">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-12pxr px-12pxr py-12pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 [&::-webkit-details-marker]:hidden">
                    <ChevronDown
                      className="size-16pxr shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                    <span className="text-b1 font-bold">{order.orderCode}</span>
                    <Badge
                      variant={
                        order.attribution === RISK_ATTRIBUTION.DELAY_INDUCED ? 'danger' : 'neutral'
                      }
                      dot={false}
                    >
                      {ATTRIBUTION_LABEL[order.attribution]}
                    </Badge>
                    <OrderDates order={order} option={option} />
                  </summary>
                  <p className="pr-12pxr pl-40pxr text-b2 text-foreground">{order.riskReason}</p>
                  <div className="flex flex-col gap-4pxr py-12pxr pr-12pxr pl-40pxr">
                    <p className="text-caption font-bold text-muted-foreground">주문 상품</p>
                    <ul className="flex flex-col gap-4pxr">
                      {order.lines.map((line) => (
                        <li
                          key={line.lineNo}
                          className="flex justify-between gap-8pxr text-b2 text-muted-foreground"
                        >
                          <span>
                            <span className="font-bold text-foreground">{line.productName}</span>{' '}
                            {line.skuCode}
                          </span>
                          <span>미출고 {formatNumber(line.openQuantity)}개</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DetailSubsection>
  )
}

interface OrderDatesProps {
  order: RiskOrder
  option?: DelayOption
}

/**
 * 주문 줄 오른쪽. 대응안의 결과가 있으면 그 대응안 기준으로 회복(배송일) 또는 남은 위험(사유)을 보여 주고,
 * 없으면 대응 전 약속 → 예상 날짜를 보여 준다. 회복이면 대응 전 예상일은 오해를 부르니 숨긴다.
 */
function OrderDates({ order, option }: OrderDatesProps) {
  const result = option ? getOrderResult(order, option) : null

  if (result?.kind === ORDER_OUTCOME.RECOVERED) {
    return (
      <span className="ml-auto flex items-center gap-8pxr text-b2 text-muted-foreground">
        <span>약속 {formatMMDD(order.promisedDate)}</span>
        <Badge variant="success" dot={false}>
          회복{result.expectedDate && ` · ${formatMMDD(result.expectedDate)} 배송`}
        </Badge>
      </span>
    )
  }
  if (result?.kind === ORDER_OUTCOME.NOT_RECOVERED) {
    return (
      <span className="ml-auto flex items-center gap-8pxr text-b2 text-muted-foreground">
        <span>
          약속 {formatMMDD(order.promisedDate)} → 예상 {formatMMDD(order.expectedDate)}
        </span>
        <Badge variant="danger" dot={false}>
          남은 위험{result.reason && ` · ${getReasonLabel(result.reason)}`}
        </Badge>
      </span>
    )
  }
  return (
    <span className="ml-auto text-b2 text-muted-foreground">
      약속 {formatMMDD(order.promisedDate)} → 예상 {formatMMDD(order.expectedDate)}
    </span>
  )
}
