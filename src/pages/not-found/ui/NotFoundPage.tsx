import { useNavigate } from 'react-router'

import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

/**
 * 없는 주소로 들어왔을 때 보여 주는 화면. 로그인 여부와 관계없이 같은 모습이고,
 * "홈으로"는 대시보드로 보낸다(로그인하지 않았으면 로그인 화면으로, 내부 계정이면 관리 화면으로 이어진다).
 * 로그인 화면과 같은 배경 위에 가는 큰 숫자와 여백만으로 완성하고, 요소는 아래에서 차례로 떠오른다.
 */
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-r from-muted via-[#fcf9fd] to-[#f5e1ed] px-16pxr py-48pxr">
      {/* 숫자 뒤의 옅은 빛 번짐. 가로 스크롤이 생기지 않게 main에서 overflow를 잘라 둔다 */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 size-480pxr -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-200/40 blur-3xl motion-safe:animate-aurora"
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-440pxr flex-col items-center text-center">
        <Logo className="w-88pxr motion-safe:animate-rise" />

        <p
          className="mt-56pxr text-kpi font-light tracking-tighter text-primary tabular-nums motion-safe:animate-rise motion-safe:[animation-delay:80ms]"
          aria-hidden="true"
        >
          404
        </p>

        <span
          className="mt-24pxr h-1pxr w-32pxr bg-primary/40 motion-safe:animate-rise motion-safe:[animation-delay:160ms]"
          aria-hidden="true"
        />

        <div className="mt-24pxr flex flex-col gap-8pxr motion-safe:animate-rise motion-safe:[animation-delay:240ms]">
          <h1 className="text-h2 font-bold text-foreground">페이지를 찾을 수 없습니다</h1>
          <p className="text-b2 text-muted-foreground">
            주소가 바뀌었거나 없는 페이지입니다.
            <br />
            주소를 다시 확인해 주세요.
          </p>
        </div>

        <Button
          size="lg"
          className="mt-40pxr w-200pxr motion-safe:animate-rise motion-safe:[animation-delay:320ms]"
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          홈으로
        </Button>
      </div>
    </main>
  )
}
