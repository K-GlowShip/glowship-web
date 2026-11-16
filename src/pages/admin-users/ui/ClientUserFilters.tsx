import { useId } from 'react'

import { Dropdown } from '@/shared/ui/dropdown'

import { CLIENT_ROLE_OPTIONS } from '../model/client-user-text'
import { ALL_ROLES, type RoleFilter } from '../model/use-client-user-filters'
import { CompanyField, type CompanyOption } from './CompanyField'

const ROLE_FILTER_OPTIONS = [
  { value: ALL_ROLES, label: '전체' },
  ...CLIENT_ROLE_OPTIONS.map(({ code, label }) => ({ value: code, label })),
]

interface ClientUserFiltersProps {
  companies: [CompanyOption, ...CompanyOption[]]
  companyId: string
  onCompanyChange: (companyId: string) => void
  roleFilter: RoleFilter
  onRoleChange: (roleFilter: string) => void
}

/** 계정 목록 위의 고객사·역할 선택 */
export function ClientUserFilters({
  companies,
  companyId,
  onCompanyChange,
  roleFilter,
  onRoleChange,
}: ClientUserFiltersProps) {
  const roleLabelId = useId()

  return (
    <div className="flex flex-wrap items-end gap-16pxr">
      <div className="w-240pxr max-w-full">
        <CompanyField companies={companies} value={companyId} onChange={onCompanyChange} />
      </div>
      <div className="flex w-160pxr flex-col gap-4pxr">
        <p id={roleLabelId} className="text-b2 font-bold text-foreground">
          역할
        </p>
        <Dropdown
          aria-labelledby={roleLabelId}
          options={ROLE_FILTER_OPTIONS}
          value={roleFilter}
          onChange={onRoleChange}
        />
      </div>
    </div>
  )
}
