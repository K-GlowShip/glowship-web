import { CircleCheck } from 'lucide-react'

import { getRoleLabel } from '@/entities/session'
import type { CreatedClientUser } from '@/shared/api'
import { Button } from '@/shared/ui/button'

interface CreatedSummaryProps {
  user: CreatedClientUser
  onCreateAnother: () => void
}

/** 계정을 만든 뒤 보여 주는 결과. 초기 비밀번호는 다시 볼 수 없다는 점을 알린다 */
export function CreatedSummary({ user, onCreateAnother }: CreatedSummaryProps) {
  return (
    <div className="flex flex-col gap-20pxr">
      <div role="status" className="flex items-center gap-8pxr">
        <CircleCheck className="size-20pxr text-success" aria-hidden="true" />
        <h2 className="text-h3 font-bold">계정을 만들었습니다</h2>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-20pxr gap-y-8pxr text-b1">
        <dt className="text-muted-foreground">이메일</dt>
        <dd className="min-w-0 break-all">{user.email}</dd>
        <dt className="text-muted-foreground">이름</dt>
        <dd className="min-w-0 break-all">{user.displayName}</dd>
        <dt className="text-muted-foreground">역할</dt>
        <dd>{getRoleLabel(user.roleCode)}</dd>
      </dl>
      <p className="text-b2 text-muted-foreground">
        초기 비밀번호는 다시 볼 수 없으니, 사용자에게 전달했는지 확인해 주세요.
      </p>
      <Button variant="secondary" onClick={onCreateAnother} className="self-start">
        다른 계정 만들기
      </Button>
    </div>
  )
}
