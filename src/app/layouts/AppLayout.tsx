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
      <aside className="w-200pxr shrink-0 border-r border-gray-200 p-16pxr">
        <nav className="flex flex-col gap-8pxr">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded px-12pxr py-8pxr hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-semibold' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-28pxr">
        <Outlet />
      </main>
    </div>
  )
}
