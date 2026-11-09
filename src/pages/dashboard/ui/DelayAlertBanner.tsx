import { useQuery } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import { Link } from 'react-router'

import { getNewDelayFrom } from '@/entities/delay-event'
import { delayEventQueries } from '@/shared/api'
import { delayCenterNewDelaysPath, delayCenterPath } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatMMDD } from '@/shared/lib/kst-date'
import { buttonVariants } from '@/shared/ui/button'

// buttonVariants의 기본 색(text-primary 등)을 덮어쓰려면 cn(tailwind-merge)으로 합쳐야 한다
const ACTION_CLASS_NAME = buttonVariants({ variant: 'secondary', size: 'sm' })
const ACTION_COLOR_CLASS_NAME = 'border-danger text-danger hover:bg-danger-bg'

interface DelayAlertBannerProps {
  /** 새 지연의 기준 시각(`lastSyncedAt`). 수집된 데이터가 없으면 null이고 배너를 보이지 않는다 */
  referenceAt: string | null
}

/**
 * 최근 감지되었고 최종 선택이 없는 지연을 알린다.
 * 1건이면 그 지연의 상세로, 여러 건이면 목록으로 보내서 문구가 말하는 범위와 이동 위치가 같게 한다.
 * 불러오지 못하면 알림이 없는 것으로 보고 조용히 숨긴다. 같은 지연 정보는 아래 표에서도 확인할 수 있다.
 */
export function DelayAlertBanner({ referenceAt }: DelayAlertBannerProps) {
  const detectedFrom = referenceAt ? getNewDelayFrom(referenceAt) : undefined
  // 가장 최근 1건과 전체 건수(`totalCount`)만 필요하다
  const { data } = useQuery({
    ...delayEventQueries.list({ from: detectedFrom, hasFinalDecision: false, size: 1 }),
    enabled: detectedFrom !== undefined,
  })
  const delay = data?.items[0]
  const totalCount = data?.totalCount ?? 0

  if (!detectedFrom || !delay || totalCount === 0) {
    return null
  }

  const isSingle = totalCount === 1
  const productName = delay.representativeSku?.productName ?? '상품 정보 없음'
  const delayDescription = `입고가 ${delay.delayDays}일 지연됩니다. 계획 ${formatMMDD(delay.planned3plInboundDate)} → 예상 ${formatMMDD(delay.expected3plInboundDate)}`
  const riskDescription =
    delay.atRiskOrderCount === null ? '' : `, 위험 주문 ${delay.atRiskOrderCount}건`

  return (
    <div
      role="status"
      className="flex items-center gap-16pxr rounded-card bg-danger-bg px-24pxr py-16pxr text-danger"
    >
      <CircleAlert className="size-24pxr shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-b1 font-bold">
          {isSingle
            ? `새 지연 알림: ${delay.shipment.shipmentCode} ${productName}`
            : `새 지연 ${totalCount}건이 감지되었습니다`}
        </p>
        <p className="text-b2">
          {isSingle
            ? `${delayDescription}${riskDescription}`
            : `가장 최근 ${delay.shipment.shipmentCode} ${productName}, ${delay.delayDays}일 지연${riskDescription}`}
        </p>
      </div>
      {isSingle ? (
        <Link
          to={delayCenterPath(delay.delayEventId)}
          className={cn(ACTION_CLASS_NAME, ACTION_COLOR_CLASS_NAME)}
        >
          영향 확인하기 →
        </Link>
      ) : (
        <Link
          to={delayCenterNewDelaysPath(detectedFrom)}
          className={cn(ACTION_CLASS_NAME, ACTION_COLOR_CLASS_NAME)}
        >
          지연 대응 센터에서 보기 →
        </Link>
      )}
    </div>
  )
}
