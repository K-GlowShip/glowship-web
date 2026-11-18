import { Link, NavLink } from 'react-router'

import { cn } from '@/shared/lib/cn'

import { LnbBrand } from './LnbBrand'
import type { NavItem } from './nav-items'

interface AppLnbProps {
  items: readonly NavItem[]
  /** 로고를 누르면 가는 화면 */
  homePath: string
}

/** 웹(web, 1024px 이상)의 고정 사이드바. 모바일에서는 숨기고 하단 탭바(BottomTabBar)를 쓴다 */
export function AppLnb({ items, homePath }: AppLnbProps) {
  return (
    <aside className="hidden w-200pxr shrink-0 flex-col border-r border-border bg-card web:flex">
      {/* 높이를 오른쪽 헤더(AppGnb)와 맞춘다 */}
      <Link
        to={homePath}
        className="flex h-64pxr shrink-0 items-center gap-8pxr px-26pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
      >
        <LnbBrand />
      </Link>
      <nav aria-label="주 메뉴" className="flex flex-col gap-8pxr overflow-y-auto p-16pxr">
        {items.map(({ to, label, icon: Icon }) => (
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
