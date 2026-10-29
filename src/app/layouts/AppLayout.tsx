import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'

import { AppGnb } from './AppGnb'
import { AppLnb } from './AppLnb'

export function AppLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // 본문만 스크롤되므로 화면을 이동하면 스크롤 위치를 맨 위로 되돌린다
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-screen">
      <AppLnb />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppGnb />
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto p-28pxr">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
