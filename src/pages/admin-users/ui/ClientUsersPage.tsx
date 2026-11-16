import { useQuery } from '@tanstack/react-query'

import { useAssignedCompanies } from '@/entities/session'
import { adminUserQueries, type AssignedCompany } from '@/shared/api'
import { useDetailDialog } from '@/shared/lib/use-detail-dialog'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { TableTemplate } from '@/shared/ui/table-template'

import { useClientUserFilters } from '../model/use-client-user-filters'
import { ClientUserFilters } from './ClientUserFilters'
import { ClientUserTable } from './ClientUserTable'
import { CreateClientUserDrawer } from './CreateClientUserDrawer'

/**
 * 관리자가 고객사의 Client 계정을 보고 만드는 화면(`GET`·`POST /admin/users`). 관리자(`ADMIN`)만 쓸 수 있다.
 * 목록은 담당 고객사면 볼 수 있고, 계정 만들기는 계정 관리 권한이 있는 고객사에서만 보인다(명세 D25).
 */
export function ClientUsersPage() {
  const [first, ...rest] = useAssignedCompanies()

  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">고객사 계정</h1>
        <p className="text-b1 text-muted-foreground">고객사의 팀장·팀원 계정을 확인하고 만듭니다</p>
      </header>

      {first ? (
        <ClientUsersContent companies={[first, ...rest]} />
      ) : (
        <Card role="alert" className="p-24pxr text-b1 text-muted-foreground">
          담당 고객사가 없어 계정을 볼 수 없습니다. 관리자 설정을 확인해 주세요.
        </Card>
      )}
    </div>
  )
}

function ClientUsersContent({ companies }: { companies: [AssignedCompany, ...AssignedCompany[]] }) {
  const filters = useClientUserFilters(companies)
  const drawer = useDetailDialog<AssignedCompany>()
  const query = useQuery(adminUserQueries.list(filters.params))
  const { company } = filters

  return (
    <>
      <ClientUserFilters
        companies={companies}
        companyId={company.companyId}
        onCompanyChange={filters.onCompanyChange}
        roleFilter={filters.roleFilter}
        onRoleChange={filters.onRoleChange}
      />

      <TableTemplate
        Title="계정 목록"
        totalCount={query.data?.totalCount}
        page={filters.page}
        pageCount={query.data ? Math.max(1, query.data.totalPages) : undefined}
        onPageChange={filters.onPageChange}
        Controls={
          company.canManageClientAccounts ? (
            <Button onClick={() => drawer.show(company)}>계정 만들기</Button>
          ) : (
            <p className="text-b2 text-muted-foreground">
              계정 관리 권한이 없어 조회만 할 수 있습니다.
            </p>
          )
        }
      >
        <ClientUserTable query={query} />
      </TableTemplate>

      {drawer.selected && (
        <CreateClientUserDrawer
          company={drawer.selected}
          open={drawer.open}
          onOpenChange={drawer.onOpenChange}
          onCloseAutoFocus={drawer.onCloseAutoFocus}
        />
      )}
    </>
  )
}
