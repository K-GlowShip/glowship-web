import { Button } from '@/shared/ui/button'

interface QueryErrorProps {
  message: string
  onRetry: () => void
  loading?: boolean
}

/** 목록·카드를 불러오지 못했을 때 보여 주는 안내와 다시 시도 버튼 */
export function QueryError({ message, onRetry, loading }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center gap-12pxr py-48pxr">
      <p role="alert" className="text-b1 text-muted-foreground">
        {message}
      </p>
      <Button variant="secondary" size="sm" loading={loading} onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  )
}
