import { ROUTES } from '@/shared/config'

import { DashboardSkeleton } from './DashboardSkeleton'
import { DelayCenterSkeleton } from './DelayCenterSkeleton'
import { DelayDetailRouteSkeleton } from './DelayDetailRouteSkeleton'
import { DetailSkeleton } from './DetailSkeleton'
import { HistorySkeleton } from './HistorySkeleton'
import { ListSkeleton } from './ListSkeleton'
import { SyncDataSkeleton } from './SyncDataSkeleton'

const SKELETON_BY_PATH: Record<string, () => React.JSX.Element> = {
  [ROUTES.DASHBOARD]: DashboardSkeleton,
  [ROUTES.DELAY_CENTER]: DelayCenterSkeleton,
  [ROUTES.DECISION_HISTORY]: HistorySkeleton,
  [ROUTES.SYNC_DATA]: SyncDataSkeleton,
  [ROUTES.ADMIN_USERS]: ListSkeleton,
}

/**
 * 이동할 화면 경로에 맞는 뼈대를 그린다. 경로가 정확히 맞는 화면은 그 화면의 모양을,
 * 지연 상세(`/delay-center/…`)와 나머지는 상세형 뼈대를 쓴다.
 */
export function PageSkeleton({ pathname }: { pathname: string }) {
  const path = pathname.replace(/\/$/, '')
  // 지연 상세는 화면이 열린 뒤에 보이는 뼈대와 같은 모양을 써서, 뼈대가 두 번 바뀌어 보이지 않게 한다
  const Skeleton = path.startsWith(`${ROUTES.DELAY_CENTER}/`)
    ? DelayDetailRouteSkeleton
    : (SKELETON_BY_PATH[path] ?? DetailSkeleton)
  return <Skeleton />
}
