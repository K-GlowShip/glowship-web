import { AlarmClock, History, LayoutDashboard, Plug } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { to: '/delay-center', label: '지연 대응 센터', icon: AlarmClock },
  { to: '/decision-history', label: '의사결정 이력', icon: History },
  { to: '/sync-data', label: '데이터 동기화', icon: Plug },
]
