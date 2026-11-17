import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { CompanyField, useAssignedCompanies } from '@/entities/session'
import { type AssignedCompany, type OperatingRuleSet, operatingRuleQueries } from '@/shared/api'
import { useDetailDialog } from '@/shared/lib/use-detail-dialog'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { pickBaseVersion } from '../model/operating-rule-form'
import { CreateRuleSetDrawer } from './CreateRuleSetDrawer'
import { RuleSetSheet } from './RuleSetSheet'
import { VersionList } from './VersionList'

const PAGE_TITLE = '운영 기준 관리'
const PAGE_DESCRIPTION = '고객사의 안전재고·판매 기준·리드타임을 버전으로 관리합니다'

/**
 * 관리자가 담당 고객사의 운영 기준 버전을 보고 새 버전을 저장하는 화면(`GET`·`POST /admin/operating-rule-sets`).
 * 관리자 계정(`ADMIN`)만 쓸 수 있다. 계정 관리 권한과 달리 담당 고객사이기만 하면 된다.
 */
export function OperatingRulesPage() {
  const [first, ...rest] = useAssignedCompanies()

  if (!first) {
    return (
      <div className="flex flex-col gap-24pxr">
        <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <Card role="alert" className="rounded-panel p-24pxr text-b1 text-muted-foreground">
          담당 고객사가 없어 운영 기준을 볼 수 없습니다. 관리자 설정을 확인해 주세요.
        </Card>
      </div>
    )
  }
  return <OperatingRulesContent companies={[first, ...rest]} />
}

function OperatingRulesContent({
  companies,
}: {
  companies: [AssignedCompany, ...AssignedCompany[]]
}) {
  const [companyId, setCompanyId] = useState('')
  const [versionId, setVersionId] = useState('')
  const company = companies.find((option) => option.companyId === companyId) ?? companies[0]
  // 드로어를 여는 순간의 고객사와 기준 버전을 고정한다. 폼을 채운 뒤 목록이 다시 받아져도 칸과 입력값이 어긋나지 않는다
  const drawer = useDetailDialog<{ company: AssignedCompany; base: OperatingRuleSet | undefined }>()
  const { data, error, isFetching, refetch } = useQuery(
    operatingRuleQueries.list(company.companyId),
  )

  const ruleSets = data?.items
  // 새 버전은 지금 적용 중인 버전의 값을 채워 만든다
  const base = pickBaseVersion(ruleSets)
  // 고르지 않았거나 고객사를 바꿔 고른 버전이 없으면 적용 중인 버전을 보여 준다
  const selected = ruleSets?.find((item) => item.operatingRuleSetId === versionId) ?? base

  const createButton = (
    <Button disabled={!data} onClick={() => drawer.show({ company, base })}>
      <Plus aria-hidden="true" />새 버전 만들기
    </Button>
  )

  return (
    <div className="flex flex-col gap-24pxr">
      <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
        <CompanyField companies={companies} value={company.companyId} onChange={setCompanyId} />
      </PageHeader>

      <Card className="rounded-panel">
        {!ruleSets && error && (
          <QueryError message={error.message} loading={isFetching} onRetry={() => void refetch()} />
        )}
        {!ruleSets && !error && <RuleSetSkeleton />}
        {ruleSets && !selected && (
          <div className="flex flex-col items-center gap-16pxr px-24pxr py-64pxr text-center">
            <p className="text-b1 text-muted-foreground">저장된 운영 기준이 없습니다.</p>
            {createButton}
          </div>
        )}
        {ruleSets && selected && (
          <div className="grid lg:grid-cols-[15rem_1fr]">
            <div className="border-b border-border p-16pxr lg:border-r lg:border-b-0">
              <VersionList
                ruleSets={ruleSets}
                selectedId={selected.operatingRuleSetId}
                onSelect={setVersionId}
              />
            </div>
            <div className="min-w-0 p-32pxr">
              <RuleSetSheet ruleSet={selected} action={createButton} />
            </div>
          </div>
        )}
      </Card>

      {drawer.selected && (
        <CreateRuleSetDrawer
          company={drawer.selected.company}
          base={drawer.selected.base}
          open={drawer.open}
          onOpenChange={drawer.onOpenChange}
          onCloseAutoFocus={drawer.onCloseAutoFocus}
        />
      )}
    </div>
  )
}

/** 불러오는 동안 실제 화면과 같은 자리에 두는 뼈대 */
function RuleSetSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-24pxr p-32pxr">
      <span className="sr-only">불러오는 중입니다.</span>
      <Skeleton className="h-32pxr w-160pxr" />
      <Skeleton className="h-120pxr" />
      <Skeleton className="h-160pxr" />
    </div>
  )
}
