import { NavLink } from 'react-router'

import { cn } from '@/shared/lib/cn'

import { NAV_ITEMS } from './nav-items'

export function AppLnb() {
  return (
    <aside className="w-200pxr shrink-0 overflow-y-auto border-r border-border bg-card p-16pxr">
      <nav aria-label="주 메뉴" className="flex flex-col gap-8pxr">
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
