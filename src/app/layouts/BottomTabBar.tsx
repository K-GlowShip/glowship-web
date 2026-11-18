import { NavLink } from 'react-router'

import { cn } from '@/shared/lib/cn'

import type { NavItem } from './nav-items'

interface BottomTabBarProps {
  items: readonly NavItem[]
}

/**
 * 모바일(lg 미만)의 하단 메뉴. 웹의 사이드바(AppLnb) 자리를 대신한다.
 * 메뉴 수가 몇 개든 칸을 똑같이 나눠 가로를 채운다(2개면 반반).
 * 화면 아래에 겹쳐 띄우지 않고 본문 아래에 이어 붙여서, 키보드가 올라와도 입력칸을 가리지 않는다.
 */
export function BottomTabBar({ items }: BottomTabBarProps) {
  return (
    <nav
      aria-label="주 메뉴"
      className="flex shrink-0 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex h-56pxr min-w-0 flex-1 flex-col items-center justify-center gap-4pxr px-4pxr text-caption transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 focus-visible:ring-inset',
              isActive ? 'font-bold text-primary' : 'text-muted-foreground',
            )
          }
        >
          <Icon className="size-20pxr shrink-0" aria-hidden="true" />
          <span className="max-w-full truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
