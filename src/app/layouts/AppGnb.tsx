import { Bell } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

// 로그인 연동 전까지 Figma 예시 값을 사용한다
const USER = { name: '김민지', role: '팀장' }

/** title이 있으면 왼쪽에 보여 준다. 본문 제목이 스크롤로 가려졌을 때 쓴다. */
export function AppGnb({ title }: { title: string }) {
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
      <Button variant="ghost" size="icon" aria-label="알림">
        <Bell />
      </Button>
      <Avatar aria-hidden="true">{USER.name[0]}</Avatar>
      <span className="text-b2 text-foreground">
        {USER.name} · {USER.role}
      </span>
    </header>
  )
}
