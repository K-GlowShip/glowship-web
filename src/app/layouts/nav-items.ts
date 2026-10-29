import { AlarmClock, History, LayoutDashboard, Plug } from 'lucide-react'

import { ROUTES } from '@/shared/config'

export const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: '대시보드', icon: LayoutDashboard },
  { to: ROUTES.DELAY_CENTER, label: '지연 대응 센터', icon: AlarmClock },
  { to: ROUTES.DECISION_HISTORY, label: '의사결정 이력', icon: History },
  { to: ROUTES.SYNC_DATA, label: '데이터 동기화', icon: Plug },
]
