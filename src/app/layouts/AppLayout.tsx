import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigation } from 'react-router'

import { AppGnb } from './AppGnb'
import { AppLnb } from './AppLnb'
import { NAV_ITEMS } from './nav-items'
import { PageSkeleton } from './PageSkeleton'

// 화면 제목(h1)이 본문 위쪽 여백(28px)과 제목 높이(40px)만큼 스크롤되면 완전히 가려진다
const TITLE_HIDDEN_SCROLL_TOP = 68

export function AppLayout() {
  const { pathname } = useLocation()
  // 아직 내려받지 않은 화면으로 이동하는 동안 이전 화면 대신 뼈대를 보여 준다
  const isNavigating = useNavigation().state === 'loading'
  const mainRef = useRef<HTMLElement>(null)
  const pageTitle =
    NAV_ITEMS.find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))?.label ?? ''
  const [isTitleHidden, setIsTitleHidden] = useState(false)

  // 본문만 스크롤되므로 화면을 이동하면 스크롤 위치를 맨 위로 되돌린다.
  // 위쪽에 가려진 제목을 헤더에 보여 주는 상태(isTitleHidden)도 이 스크롤 이벤트로 함께 풀린다
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-screen">
      <AppLnb />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppGnb title={isTitleHidden ? pageTitle : ''} />
        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-y-auto p-28pxr"
          onScroll={(event) =>
            setIsTitleHidden(event.currentTarget.scrollTop > TITLE_HIDDEN_SCROLL_TOP)
          }
        >
          {isNavigating ? <PageSkeleton /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
