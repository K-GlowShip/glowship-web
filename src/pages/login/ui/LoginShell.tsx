import type { ReactNode } from 'react'

import { Logo } from '@/shared/ui/logo'

import { LoginHero } from './LoginHero'

/**
 * 로그인 화면의 틀: 배경, 왼쪽 소개, 오른쪽 카드와 제목. 카드 안의 내용은 `children`으로 받는다.
 * 로그인 폼과 로그인 여부를 확인하는 동안의 대기 화면이 같은 틀을 써서, 대기 화면에서 폼으로 바뀔 때 레이아웃이 움직이지 않는다.
 */
export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-linear-to-r from-muted via-[#fcf9fd] to-[#f5e1ed]">
      <div className="mx-auto flex min-h-screen w-full max-w-1200pxr items-center justify-center px-16pxr py-32pxr lg:gap-300pxr">
        <LoginHero />
        <div className="flex w-full flex-col items-center gap-24pxr lg:w-auto">
          <Logo className="w-96pxr lg:hidden" />
          <div className="w-420pxr max-w-full rounded-panel bg-card p-32pxr shadow-[0_8px_32px_rgba(37,35,49,0.08)]">
            <header className="mb-24pxr text-center">
              <h1 className="text-h2 font-bold text-foreground">로그인</h1>
              <p className="mt-2pxr text-caption text-muted-foreground">
                GlowShip 워크스페이스에 오신 것을 환영합니다.
              </p>
            </header>
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
