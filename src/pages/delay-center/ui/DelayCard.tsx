import { MessageSquare } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'

import {
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  type DelayCase,
  formatExtraSkus,
  formatRoute,
} from '../model/delay-center'
import { EMPTY_TEXT } from '../model/delay-center-text'

interface DelayCardProps {
  delayCase: DelayCase
  selected: boolean
  onSelect: (id: string) => void
}

/** 지연 목록의 카드 하나. 선적 하나에 해당한다. */
export function DelayCard({ delayCase, selected, onSelect }: DelayCardProps) {
  const opinionCount = delayCase.opinions.length

  return (
    <button
      type="button"
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect(delayCase.id)}
      className={cn(
        'flex w-full cursor-pointer flex-col gap-8pxr rounded-card border bg-card p-16pxr text-left outline-none',
        'hover:bg-background focus-visible:ring-[3px] focus-visible:ring-primary/30',
        selected
          ? 'border-primary bg-primary-50 shadow-[inset_0_0_0_1px_var(--color-primary)]'
          : 'border-border',
      )}
    >
      <span className="flex items-center justify-between gap-8pxr">
        <span className="text-b1 font-bold">{delayCase.shipmentCode}</span>
        <span className="text-b2 font-bold text-danger">+{delayCase.delayDays}일</span>
      </span>
      <span className="flex min-w-0 items-baseline gap-4pxr text-b1 text-foreground">
        <span className="truncate">{delayCase.productName ?? EMPTY_TEXT.PRODUCT}</span>
        <span className="shrink-0 text-muted-foreground">
          {formatExtraSkus(delayCase.skuCount)}
        </span>
      </span>
      <span className="flex items-center justify-between gap-8pxr">
        <span className="flex items-center gap-8pxr">
          <Badge variant={DELAY_STATUS_BADGE_VARIANT[delayCase.status]}>
            {DELAY_STATUS_LABEL[delayCase.status]}
          </Badge>
          {opinionCount > 0 && (
            <span
              className="flex items-center gap-2pxr text-caption text-muted-foreground"
              aria-label={`팀원 의견 ${opinionCount}건`}
            >
              <MessageSquare className="size-14pxr" aria-hidden="true" />
              {opinionCount}
            </span>
          )}
        </span>
        <span className="text-caption text-muted-foreground">{formatRoute(delayCase)}</span>
      </span>
    </button>
  )
}
