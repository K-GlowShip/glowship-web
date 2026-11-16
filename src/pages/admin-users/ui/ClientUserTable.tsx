import { getRoleLabel } from '@/entities/session'
import type { ClientUser } from '@/shared/api'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
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

import { getUserStatusLabel, USER_STATUS_BADGE_VARIANT } from '../model/client-user-display'

interface ClientUserTableProps {
  query: ListQuery<ClientUser>
}

const COLUMN_COUNT = 4

export function ClientUserTable({ query }: ClientUserTableProps) {
  return (
    <Table className="min-w-640pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-260pxr">이름</TableHead>
          <TableHead className="w-100pxr">역할</TableHead>
          <TableHead className="w-110pxr">상태</TableHead>
          <TableHead className="w-160pxr">생성일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableQueryRows query={query} colSpan={COLUMN_COUNT} emptyMessage="등록된 계정이 없습니다.">
          {(users) =>
            users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="wrap-break-word">
                  {user.displayName}
                  <p className="text-b2 text-muted-foreground">{user.email}</p>
                </TableCell>
                <TableCell>{getRoleLabel(user.roleCode)}</TableCell>
                <TableCell>
                  <Badge variant={USER_STATUS_BADGE_VARIANT[user.status] ?? 'neutral'}>
                    {getUserStatusLabel(user.status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatYYYYMMDDHHmm(user.createdAt)}</TableCell>
              </TableRow>
            ))
          }
        </TableQueryRows>
      </TableBody>
    </Table>
  )
}
