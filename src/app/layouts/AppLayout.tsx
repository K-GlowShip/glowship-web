import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigation } from 'react-router'

import { AppGnb } from './AppGnb'
import { AppLnb } from './AppLnb'
import { BottomTabBar } from './BottomTabBar'
import type { NavItem } from './nav-items'
import { PageSkeleton } from './page-skeletons'

// 화면 제목(h1)이 본문 위쪽 여백(28px)과 제목 높이(40px)만큼 스크롤되면 완전히 가려진다
const TITLE_HIDDEN_SCROLL_TOP = 68

interface AppLayoutProps {
  navItems: readonly NavItem[]
  /** 로고를 누르면 가는 화면 */
  homePath: string
  /** 새 지연 알림 종을 보일지 */
  showNotification?: boolean
}

export function AppLayout({ navItems, homePath, showNotification = true }: AppLayoutProps) {
  const { pathname } = useLocation()
  // 아직 내려받지 않은 화면으로 이동하는 동안 이전 화면 대신 뼈대를 보여 준다
  const navigation = useNavigation()
  const isNavigating = navigation.state === 'loading'
  const mainRef = useRef<HTMLElement>(null)
  const pageTitle =
    navItems.find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))?.label ?? ''
  const [isTitleHidden, setIsTitleHidden] = useState(false)

  // 본문만 스크롤되므로 화면을 이동하면 스크롤 위치를 맨 위로 되돌린다.
  // 위쪽에 가려진 제목을 헤더에 보여 주는 상태(isTitleHidden)도 이 스크롤 이벤트로 함께 풀린다
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-dvh">
      <AppLnb items={navItems} homePath={homePath} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppGnb
          homePath={homePath}
          title={isTitleHidden ? pageTitle : ''}
          showNotification={showNotification}
        />
        <main
          ref={mainRef}
          className="relative min-h-0 flex-1 scrollbar-gutter-stable overflow-y-auto p-16pxr web:p-28pxr"
          onScroll={(event) =>
            setIsTitleHidden(event.currentTarget.scrollTop > TITLE_HIDDEN_SCROLL_TOP)
          }
        >
          {isNavigating ? <PageSkeleton pathname={navigation.location.pathname} /> : <Outlet />}
        </main>
        <BottomTabBar items={navItems} />
      </div>
    </div>
  )
}
