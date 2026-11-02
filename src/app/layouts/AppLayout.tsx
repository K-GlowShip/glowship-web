import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import { AppGnb } from './AppGnb'
import { AppLnb } from './AppLnb'

export function AppLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const [scrolledTitle, setScrolledTitle] = useState('')

  // 본문만 스크롤되므로 화면을 이동하면 스크롤 위치를 맨 위로 되돌린다
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  // 화면 제목(h1)이 스크롤로 가려지면 헤더에 같은 제목을 보여 준다
  useEffect(() => {
    const main = mainRef.current
    const heading = main?.querySelector('h1')
    if (!main || !heading) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolledTitle(entry.isIntersecting ? '' : (heading.textContent ?? '')),
      { root: main },
    )
    observer.observe(heading)

    return () => {
      observer.disconnect()
      setScrolledTitle('')
    }
  }, [pathname])

  return (
    <div className="flex h-screen">
      <AppLnb />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppGnb title={scrolledTitle} />
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto p-28pxr">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
