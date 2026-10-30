import { Logo } from '@/shared/ui/logo'

import { LoginForm } from './LoginForm'
import { LoginHero } from './LoginHero'

export function LoginPage() {
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
            <LoginForm />
            {/* TODO: 관리자 문의 경로 확정 후 연결 */}
            <p className="mt-20pxr text-center text-caption text-muted-foreground">
              계정이 없으신가요?{' '}
              <button type="button" className="cursor-pointer text-primary hover:underline">
                관리자에게 문의
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
