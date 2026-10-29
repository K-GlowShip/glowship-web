import { NavLink, Outlet } from 'react-router'

const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/delay-center', label: '지연 대응 센터' },
  { to: '/decision-history', label: '의사결정 이력' },
  { to: '/sync-data', label: '데이터 동기화' },
]

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-gray-200 p-4">
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded px-3 py-2 hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-semibold' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
