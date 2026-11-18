import { Link } from 'react-router'

import { getRoleLabel, useLogout, useSession } from '@/entities/session'
import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

import { LnbBrand } from './LnbBrand'
import { NotificationBell } from './NotificationBell'

// 서버 없이 확인하는 데모 로그인에는 내 계정 정보(`GET /me`)가 없다
const DEMO_USER_NAME = '데모 사용자'

interface AppGnbProps {
  /** 있으면 왼쪽에 보여 준다(웹만). 본문 제목이 스크롤로 가려졌을 때 쓴다 */
  title: string
  /** 로고를 누르면 가는 화면 */
  homePath: string
  /** 새 지연 알림 종을 보일지. 고객사 데이터를 읽어서 고객사에 소속된 계정에만 의미가 있다 */
  showNotification?: boolean
}

export function AppGnb({ homePath, title, showNotification = true }: AppGnbProps) {
  const { me } = useSession()
  const { mutate: submitLogout, isPending } = useLogout()
  const userName = me?.displayName ?? DEMO_USER_NAME

  return (
    <header className="flex h-64pxr shrink-0 items-center gap-12pxr border-b border-border bg-card px-16pxr lg:px-28pxr">
      {/* 웹은 사이드바 맨 위에 로고가 있으니, 사이드바가 없는 모바일에서만 헤더에 둔다 */}
      <Link
        to={homePath}
        className="flex items-center gap-8pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 lg:hidden"
      >
        <LnbBrand />
      </Link>
      {/* 모바일은 본문이 좁고 로고가 왼쪽에 있어서 보여 주지 않는다. 빈 공간만 둬 오른쪽 요소를 밀어낸다 */}
      <p
        aria-hidden="true"
        className={cn(
          'mr-auto hidden min-w-0 items-center gap-8pxr text-b1 transition-opacity duration-200 lg:flex',
          title ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="shrink-0 text-muted-foreground">워크스페이스</span>
        <span className="shrink-0 text-muted-foreground">/</span>
        <span className="truncate font-bold text-foreground">{title}</span>
      </p>
      <div className="flex-1 lg:hidden" />
      {showNotification && <NotificationBell />}
      <Avatar aria-hidden="true">{Array.from(userName)[0]}</Avatar>
      <span className="hidden text-b2 text-foreground lg:inline">
        {me ? `${userName} · ${getRoleLabel(me.roleCode)}` : userName}
      </span>
      {me?.companyName && (
        <span className="hidden text-b2 text-muted-foreground lg:inline">{me.companyName}</span>
      )}
      <Button variant="ghost" size="sm" loading={isPending} onClick={() => submitLogout()}>
        로그아웃
      </Button>
    </header>
  )
}
