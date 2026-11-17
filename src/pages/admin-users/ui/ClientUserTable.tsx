import { getRoleLabel } from '@/entities/session'
import { type ClientUser, USER_STATUS } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDD } from '@/shared/lib/kst-date'
import { Avatar } from '@/shared/ui/avatar'
import {
  type ListQuery,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableQueryRows,
  TableRow,
} from '@/shared/ui/table'

import { getUserStatusLabel } from '../model/client-user-display'

interface ClientUserTableProps {
  query: ListQuery<ClientUser>
}

const COLUMN_COUNT = 4

export function ClientUserTable({ query }: ClientUserTableProps) {
  return (
    <Table className="min-w-640pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-280pxr">계정</TableHead>
          <TableHead className="w-120pxr">역할</TableHead>
          <TableHead className="w-120pxr">상태</TableHead>
          <TableHead className="w-140pxr">생성일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableQueryRows query={query} colSpan={COLUMN_COUNT} emptyMessage="등록된 계정이 없습니다.">
          {(users) => users.map((user) => <ClientUserRow key={user.userId} user={user} />)}
        </TableQueryRows>
      </TableBody>
    </Table>
  )
}

function ClientUserRow({ user }: { user: ClientUser }) {
  // 대부분의 계정은 사용 중이라 조용히 두고, 비활성 계정만 흐리게 해서 눈에 띄게 한다
  const isDisabled = user.status === USER_STATUS.DISABLED

  return (
    <TableRow className={cn(isDisabled && 'text-disabled-foreground')}>
      <TableCell>
        <div className="flex items-center gap-12pxr">
          <Avatar
            aria-hidden="true"
            className={cn(isDisabled && 'bg-disabled text-disabled-foreground')}
          >
            {user.displayName.trim().charAt(0)}
          </Avatar>
          <div className="min-w-0">
            <p className={cn('truncate font-bold', !isDisabled && 'text-foreground')}>
              {user.displayName}
            </p>
            <p className={cn('truncate text-b2', !isDisabled && 'text-muted-foreground')}>
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>{getRoleLabel(user.roleCode)}</TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-6pxr">
          <span
            aria-hidden="true"
            className={cn(
              'size-6pxr rounded-full',
              isDisabled ? 'bg-disabled-foreground' : 'bg-success',
            )}
          />
          {getUserStatusLabel(user.status)}
        </span>
      </TableCell>
      <TableCell className="tabular-nums">{formatYYYYMMDD(user.createdAt)}</TableCell>
    </TableRow>
  )
}
