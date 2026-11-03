import { ChevronDown } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'

import { ATTRIBUTION_LABEL, formatMonthDay, type RiskOrder } from '../model/delay-center'

interface AtRiskOrdersProps {
  orders: RiskOrder[]
}

/** 위험 주문은 주문 단위로 묶고, 품목(상세)은 펼쳐서 본다. 주문마다 지연 유발·기존 위험을 표시한다. */
export function AtRiskOrders({ orders }: AtRiskOrdersProps) {
  if (orders.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="risk-orders-title" className="flex flex-col gap-12pxr">
      <h3 id="risk-orders-title" className="text-h3 font-bold">
        위험 주문 <span className="text-muted-foreground">{orders.length}</span>
      </h3>
      <ul className="flex flex-col gap-8pxr">
        {orders.map((order) => (
          <li key={order.orderCode}>
            <details className="group rounded-card border border-border bg-card">
              <summary className="flex cursor-pointer list-none items-center gap-12pxr px-16pxr py-12pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 [&::-webkit-details-marker]:hidden">
                <ChevronDown
                  className="size-16pxr shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
                <span className="text-b1 font-bold">{order.orderCode}</span>
                <Badge
                  variant={order.attribution === 'delay_induced' ? 'danger' : 'neutral'}
                  dot={false}
                >
                  {ATTRIBUTION_LABEL[order.attribution]}
                </Badge>
                <span className="ml-auto text-b2 text-muted-foreground">
                  약속 {formatMonthDay(order.promisedDate)} → 예상{' '}
                  {formatMonthDay(order.expectedDate)}
                </span>
              </summary>
              <p className="border-t border-border px-16pxr pt-12pxr text-b2 text-foreground">
                {order.riskReason}
              </p>
              <ul className="flex flex-col gap-4pxr px-16pxr py-12pxr">
                {order.lines.map((line) => (
                  <li
                    key={line.lineNo}
                    className="flex justify-between gap-8pxr text-b2 text-muted-foreground"
                  >
                    <span>
                      {line.lineNo}번 줄 · {line.skuCode}
                    </span>
                    <span>미출고 {line.openQuantity.toLocaleString()}개</span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
