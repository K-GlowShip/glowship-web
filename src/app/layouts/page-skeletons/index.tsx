import { ROUTES } from '@/shared/config'

import { DashboardSkeleton } from './DashboardSkeleton'
import { DetailSkeleton } from './DetailSkeleton'
import { ListSkeleton } from './ListSkeleton'
import { SyncDataSkeleton } from './SyncDataSkeleton'

const SKELETON_BY_PATH: Record<string, () => React.JSX.Element> = {
  [ROUTES.DASHBOARD]: DashboardSkeleton,
  [ROUTES.DELAY_CENTER]: ListSkeleton,
  [ROUTES.DECISION_HISTORY]: ListSkeleton,
  [ROUTES.SYNC_DATA]: SyncDataSkeleton,
  [ROUTES.ADMIN_USERS]: ListSkeleton,
}

/**
 * 이동할 화면 경로에 맞는 뼈대를 그린다. 경로가 정확히 맞는 화면은 그 화면의 모양을,
 * 지연 상세(`/delay-center/…`)와 나머지는 상세형 뼈대를 쓴다.
 */
export function PageSkeleton({ pathname }: { pathname: string }) {
  const Skeleton = SKELETON_BY_PATH[pathname.replace(/\/$/, '')] ?? DetailSkeleton
  return <Skeleton />
}
