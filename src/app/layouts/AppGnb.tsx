import { Bell } from 'lucide-react'

import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

// 로그인 연동 전까지 Figma 예시 값을 사용한다
const USER = { name: '김민지', role: '팀장' }

export function AppGnb() {
  return (
    <header className="flex h-64pxr shrink-0 items-center justify-end gap-12pxr border-b border-border bg-card px-28pxr">
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
