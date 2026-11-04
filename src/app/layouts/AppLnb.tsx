import { Link, NavLink } from 'react-router'

import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

import { NAV_ITEMS } from './nav-items'

export function AppLnb() {
  return (
    <aside className="flex w-200pxr shrink-0 flex-col border-r border-border bg-card">
      {/* 높이를 오른쪽 헤더(AppGnb)와 맞춘다 */}
      <Link
        to={ROUTES.DASHBOARD}
        className="flex h-64pxr shrink-0 items-center gap-8pxr px-26pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
      >
        <img src="/favicon.svg" alt="" className="h-28pxr w-auto" />
        <span className="text-h3 font-bold text-primary">GlowShip</span>
      </Link>
      <nav aria-label="주 메뉴" className="flex flex-col gap-8pxr overflow-y-auto p-16pxr">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex h-41pxr items-center gap-10pxr rounded-card px-10pxr text-b1 transition-colors',
                isActive
                  ? 'bg-primary-100 font-bold text-primary'
                  : 'text-muted-foreground hover:bg-muted',
              )
            }
          >
            <Icon className="size-17pxr shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
