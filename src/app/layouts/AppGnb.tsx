import { getRoleLabel, useLogout, useSession } from '@/entities/session'
import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

import { NotificationBell } from './NotificationBell'

// 서버 없이 확인하는 데모 로그인에는 내 계정 정보(`GET /me`)가 없다
const DEMO_USER_NAME = '데모 사용자'

/** title이 있으면 왼쪽에 보여 준다. 본문 제목이 스크롤로 가려졌을 때 쓴다. */
export function AppGnb({ title }: { title: string }) {
  const { me } = useSession()
  const { mutate: submitLogout, isPending } = useLogout()
  const userName = me?.displayName ?? DEMO_USER_NAME

  return (
    <header className="flex h-64pxr shrink-0 items-center gap-12pxr border-b border-border bg-card px-28pxr">
      <p
        aria-hidden="true"
        className={cn(
          'mr-auto flex min-w-0 items-center gap-8pxr text-b1 transition-opacity duration-200',
          title ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="shrink-0 text-muted-foreground">워크스페이스</span>
        <span className="shrink-0 text-muted-foreground">/</span>
        <span className="truncate font-bold text-foreground">{title}</span>
      </p>
      <NotificationBell />
      <Avatar aria-hidden="true">{Array.from(userName)[0]}</Avatar>
      <span className="text-b2 text-foreground">
        {me ? `${userName} · ${getRoleLabel(me.roleCode)}` : userName}
      </span>
      {me?.companyName && <span className="text-b2 text-muted-foreground">{me.companyName}</span>}
      <Button variant="ghost" size="sm" loading={isPending} onClick={() => submitLogout()}>
        로그아웃
      </Button>
    </header>
  )
}
