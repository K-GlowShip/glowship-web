import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { CompanyField, useAssignedCompanies } from '@/entities/session'
import { adminUserQueries, type AssignedCompany } from '@/shared/api'
import { useDetailDialog } from '@/shared/lib/use-detail-dialog'
import { formatNumber } from '@/shared/lib/format-number'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { TableTemplate } from '@/shared/ui/table-template'

import { useClientUserFilters } from '../model/use-client-user-filters'
import { ClientUserFilters } from './ClientUserFilters'
import { ClientUserTable } from './ClientUserTable'
import { CreateClientUserDrawer } from './CreateClientUserDrawer'

/**
 * 관리자가 고객사의 Client 계정을 보고 만드는 화면(`GET`·`POST /admin/users`). 관리자(`ADMIN`)만 쓸 수 있다.
 * 목록은 담당 고객사면 볼 수 있고, 계정 만들기는 계정 관리 권한이 있는 고객사에서만 보인다(명세 D25).
 */
const PAGE_TITLE = '고객사 계정 관리'
const PAGE_DESCRIPTION = '고객사의 팀장·팀원 계정을 확인하고 만듭니다'

export function ClientUsersPage() {
  const [first, ...rest] = useAssignedCompanies()

  if (!first) {
    return (
      <div className="flex flex-col gap-24pxr">
        <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <Card role="alert" className="rounded-panel p-24pxr text-b1 text-muted-foreground">
          담당 고객사가 없어 계정을 볼 수 없습니다. 관리자 설정을 확인해 주세요.
        </Card>
      </div>
    )
  }
  return <ClientUsersContent companies={[first, ...rest]} />
}

function ClientUsersContent({ companies }: { companies: [AssignedCompany, ...AssignedCompany[]] }) {
  const filters = useClientUserFilters(companies)
  const drawer = useDetailDialog<AssignedCompany>()
  const query = useQuery(adminUserQueries.list(filters.params))
  const { company } = filters
  const totalCount = query.data?.totalCount

  return (
    <div className="flex flex-col gap-24pxr">
      <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
        <CompanyField
          companies={companies}
          value={company.companyId}
          onChange={filters.onCompanyChange}
        />
      </PageHeader>

      <Card className="rounded-panel">
        <CardContent className="flex flex-col gap-16pxr px-24pxr pt-24pxr pb-24pxr">
          <div className="flex flex-wrap items-end justify-between gap-16pxr">
            <div>
              <p className="text-b2 text-muted-foreground">조회된 계정</p>
              {/* 숫자는 크고 가늘게, 단위는 숫자 머리 높이에 작게 올린다(대시보드 지표와 같은 표기) */}
              {/* 불러오는 동안 Skeleton(div)이 들어가므로 p가 아니라 div로 둔다 */}
              <div className="flex items-start text-display font-light tracking-[-0.03em] tabular-nums">
                {totalCount === undefined ? (
                  <Skeleton className="w-48pxr">&nbsp;</Skeleton>
                ) : (
                  <>
                    {formatNumber(totalCount)}
                    <span className="pt-[0.2em] pl-4pxr text-b1 font-normal tracking-normal text-muted-foreground">
                      명
                    </span>
                  </>
                )}
              </div>
            </div>
            {company.canManageClientAccounts ? (
              <Button onClick={() => drawer.show(company)}>
                <Plus aria-hidden="true" />
                계정 만들기
              </Button>
            ) : (
              <p className="text-b2 text-muted-foreground">
                계정 관리 권한이 없어 조회만 할 수 있습니다.
              </p>
            )}
          </div>

          <ClientUserFilters roleFilter={filters.roleFilter} onRoleChange={filters.onRoleChange} />

          <TableTemplate
            page={filters.page}
            pageCount={query.data ? Math.max(1, query.data.totalPages) : undefined}
            onPageChange={filters.onPageChange}
          >
            <ClientUserTable query={query} />
          </TableTemplate>
        </CardContent>
      </Card>

      {drawer.selected && (
        <CreateClientUserDrawer
          company={drawer.selected}
          open={drawer.open}
          onOpenChange={drawer.onOpenChange}
          onCloseAutoFocus={drawer.onCloseAutoFocus}
        />
      )}
    </div>
  )
}
