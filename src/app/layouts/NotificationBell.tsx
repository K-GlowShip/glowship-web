import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Link } from 'react-router'

import { getNewDelayFrom } from '@/entities/delay-event'
import { dashboardQueries, delayEventQueries } from '@/shared/api'
import { delayCenterNewDelaysPath, ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { buttonVariants } from '@/shared/ui/button'

/**
 * 새 지연을 다시 조회하는 간격. 명세는 푸시 없이 화면이 다시 조회하는 방식이라 폴링으로 맞추고,
 * 새 지연은 분 단위로 알려도 되므로 길게 잡는다. 탭이 가려져 있으면 TanStack Query가 멈춘다
 */
const NOTIFICATION_POLL_INTERVAL_MS = 60_000

/** 배지에 그대로 보여 주는 최대 건수. 넘으면 `99+`로 줄인다 */
const MAX_BADGE_COUNT = 99

/**
 * 알림 종. 최근 감지되었고 최종 선택이 없는 지연의 건수를 보여 주고, 누르면 그 목록으로 간다 (명세 U7).
 * 대시보드 배너와 같은 조건이며 읽음 상태는 저장하지 않는다. 건수를 못 불러오면 건수 없이 목록 링크만 둔다.
 */
export function NotificationBell() {
  const { data: summary } = useQuery({
    ...dashboardQueries.summary(),
    // 새로 수집되면 기준 시각(`lastSyncedAt`)이 바뀌어 새 지연의 범위도 달라진다
    refetchInterval: NOTIFICATION_POLL_INTERVAL_MS,
  })
  const from = summary?.lastSyncedAt ? getNewDelayFrom(summary.lastSyncedAt) : undefined
  // 건수(`totalCount`)만 필요해 1건만 받는다
  const { data } = useQuery({
    ...delayEventQueries.list({ from, hasFinalDecision: false, size: 1 }),
    enabled: from !== undefined,
    refetchInterval: NOTIFICATION_POLL_INTERVAL_MS,
  })
  const count = data?.totalCount ?? 0
  const label = count > 0 ? `알림, 새 지연 ${formatNumber(count)}건` : '알림, 새 지연 없음'

  return (
    <Link
      to={from ? delayCenterNewDelaysPath(from) : ROUTES.DELAY_CENTER}
      aria-label={label}
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}
    >
      <Bell aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-4pxr right-2pxr flex h-16pxr min-w-16pxr items-center justify-center rounded-full bg-danger px-4pxr text-caption font-bold text-white"
        >
          {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : formatNumber(count)}
        </span>
      )}
    </Link>
  )
}
