import { useAssignedCompanies } from '@/entities/session'
import { Card } from '@/shared/ui/card'

import { CreateClientUserForm } from './CreateClientUserForm'

const EmptyNotice = ({ children }: { children: string }) => (
  <Card role="alert" className="p-24pxr text-b1 text-muted-foreground">
    {children}
  </Card>
)

/**
 * 관리자가 고객사를 골라 팀장·팀원 계정을 만드는 화면(`POST /admin/users`). 관리자 계정(`ADMIN`)만 쓸 수 있다.
 * 계정 생성은 계정 관리 권한이 있는 고객사에서만 되므로 그 고객사만 고르게 한다(명세 D25).
 */
export function CreateClientUserPage() {
  const assigned = useAssignedCompanies()
  const [first, ...rest] = assigned.filter((company) => company.canManageClientAccounts)

  return (
    <div className="flex max-w-560pxr flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">고객사 계정 생성</h1>
        <p className="text-b1 text-muted-foreground">고객사에 팀장·팀원 계정을 만듭니다</p>
      </header>

      {first ? (
        <CreateClientUserForm companies={[first, ...rest]} />
      ) : (
        <EmptyNotice>
          {assigned.length === 0
            ? '담당 고객사가 없어 계정을 만들 수 없습니다. 관리자 설정을 확인해 주세요.'
            : '계정 관리 권한이 있는 고객사가 없습니다.'}
        </EmptyNotice>
      )}
    </div>
  )
}
