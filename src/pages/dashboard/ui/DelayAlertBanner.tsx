import { CircleAlert } from 'lucide-react'
import { Link } from 'react-router'

import { DELAY_STATUS } from '@/entities/delay-event'
import { delayCenterListPath, delayCenterPath } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { buttonVariants } from '@/shared/ui/button'

import { formatMonthDay, type DelayItem } from '../model/dashboard'

// buttonVariants의 기본 색(text-primary 등)을 덮어쓰려면 cn(tailwind-merge)으로 합쳐야 한다
const ACTION_CLASS_NAME = buttonVariants({ variant: 'secondary', size: 'sm' })
const ACTION_COLOR_CLASS_NAME = 'border-danger text-danger hover:bg-danger-bg'

interface DelayAlertBannerProps {
  /** 가장 최근에 감지된 새 지연. 없으면 배너를 보이지 않는다 */
  delay: DelayItem | undefined
  /** 새 지연의 전체 건수 */
  totalCount: number
}

/**
 * 최근 감지되었고 최종 선택이 없는 지연을 알린다.
 * 1건이면 그 지연의 상세로, 여러 건이면 목록으로 보내서 문구가 말하는 범위와 이동 위치가 같게 한다.
 */
export function DelayAlertBanner({ delay, totalCount }: DelayAlertBannerProps) {
  if (!delay || totalCount === 0) {
    return null
  }

  const isSingle = totalCount === 1
  const productName = delay.productName ?? '상품 정보 없음'
  const delayDescription = `입고가 ${delay.delayDays}일 지연됩니다. 계획 ${formatMonthDay(delay.planned3plInboundDate)} → 예상 ${formatMonthDay(delay.expected3plInboundDate)}`
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
            ? `새 지연 알림: ${delay.shipmentCode} ${productName}`
            : `새 지연 ${totalCount}건이 감지되었습니다`}
        </p>
        <p className="text-b2">
          {isSingle
            ? `${delayDescription}${riskDescription}`
            : `가장 최근 ${delay.shipmentCode} ${productName}, ${delay.delayDays}일 지연${riskDescription}`}
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
        // TODO: 명세의 새 지연은 '최근 감지·최종 선택 전'(hasFinalDecision=false)인데, 목록은 아직 이 조건을 쿼리로 받지 않아 선택 대기 탭으로 근사한다
        <Link
          to={delayCenterListPath(DELAY_STATUS.READY)}
          className={cn(ACTION_CLASS_NAME, ACTION_COLOR_CLASS_NAME)}
        >
          지연 대응 센터에서 보기 →
        </Link>
      )}
    </div>
  )
}
