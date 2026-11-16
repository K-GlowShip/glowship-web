import { useAssignedCompanies } from '@/entities/session'
import { Card } from '@/shared/ui/card'

import { CreateClientUserForm } from './CreateClientUserForm'

/** 관리자가 담당 고객사에 팀장·팀원 계정을 만드는 화면(`POST /admin/users`). 관리자 계정(`ADMIN`)만 쓸 수 있다. */
export function CreateClientUserPage() {
  // MVP는 한 곳만 담당한다(명세 D7). 담당 고객사 목록이 서버에서 오면 여럿 중에서 고르게 바꾼다
  const [company] = useAssignedCompanies()

  return (
    <div className="flex max-w-560pxr flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">고객사 계정 생성</h1>
        <p className="text-b1 text-muted-foreground">담당 고객사에 팀장·팀원 계정을 만듭니다</p>
      </header>

      {company ? (
        <CreateClientUserForm company={company} />
      ) : (
        <Card role="alert" className="p-24pxr text-b1 text-muted-foreground">
          담당 고객사 정보가 없어 계정을 만들 수 없습니다. 관리자 설정을 확인해 주세요.
        </Card>
      )}
    </div>
  )
}
