import { LoginForm } from './LoginForm'
import { LoginShell } from './LoginShell'

export function LoginPage() {
  return (
    <LoginShell>
      <LoginForm />
      {/* TODO: 관리자 문의 경로 확정 후 연결 */}
      <p className="mt-20pxr text-center text-caption text-muted-foreground">
        계정이 없으신가요?{' '}
        <button type="button" className="cursor-pointer text-primary hover:underline">
          관리자에게 문의
        </button>
      </p>
    </LoginShell>
  )
}
