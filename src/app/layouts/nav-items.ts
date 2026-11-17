import {
  AlarmClock,
  History,
  LayoutDashboard,
  Plug,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { ROUTES } from '@/shared/config'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.DASHBOARD, label: '대시보드', icon: LayoutDashboard },
  { to: ROUTES.DELAY_CENTER, label: '지연 대응 센터', icon: AlarmClock },
  { to: ROUTES.DECISION_HISTORY, label: '의사결정 이력', icon: History },
  { to: ROUTES.SYNC_DATA, label: '연동 데이터 조회', icon: Plug },
]

/** 관리자(`OWNER`·`ADMIN`) 메뉴. 고객사 화면의 메뉴와 따로 둔다 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.ADMIN_USERS, label: '고객사 계정 관리', icon: Users },
  { to: ROUTES.ADMIN_OPERATING_RULES, label: '운영 기준 관리', icon: SlidersHorizontal },
]
