import { Button } from '@/shared/ui/button'

interface SessionErrorProps {
  message?: string
  loading: boolean
  onRetry: () => void
}

/** 로그인 여부를 확인하지 못했을 때(서버·네트워크 오류) 보여 주는 화면 */
export function SessionError({ message, loading, onRetry }: SessionErrorProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16pxr px-16pxr">
      <p role="alert" className="text-b1 text-foreground">
        {message ?? '로그인 상태를 확인하지 못했습니다.'}
      </p>
      <Button loading={loading} onClick={onRetry}>
        다시 시도
      </Button>
    </main>
  )
}
