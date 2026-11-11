import { env } from '@/shared/config'
import { Skeleton } from '@/shared/ui/skeleton'

import { LoginShell } from './LoginShell'

/**
 * 로그인 여부를 처음 확인하는 동안 보여 주는 대기 화면. 로그인 폼과 같은 칸 크기로 자리를 잡아서
 * 폼으로 바뀔 때 카드 높이가 변하지 않게 한다(이메일·비밀번호·버튼, 데모 계정 안내 줄, 관리자 문의 줄).
 */
export function LoginSkeleton() {
  return (
    <LoginShell>
      <div className="flex flex-col gap-16pxr" aria-hidden="true">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex flex-col gap-4pxr">
            <Skeleton className="h-22pxr w-60pxr" />
            <Skeleton className="h-44pxr" />
          </div>
        ))}
        <Skeleton className="mt-16pxr h-48pxr" />
        {env.isDemoLogin && <Skeleton className="mx-auto h-18pxr w-180pxr" />}
      </div>
      <Skeleton className="mx-auto mt-20pxr h-18pxr w-220pxr" aria-hidden="true" />
    </LoginShell>
  )
}
