import { FilterTabs } from '@/shared/ui/tabs'

import { CLIENT_ROLE_OPTIONS } from '../model/client-user-text'
import { ALL_ROLES, type RoleFilter } from '../model/use-client-user-filters'

const ROLE_TABS = [
  { value: ALL_ROLES, label: '전체' },
  ...CLIENT_ROLE_OPTIONS.map(({ code, label }) => ({ value: code, label })),
]

interface ClientUserFiltersProps {
  roleFilter: RoleFilter
  onRoleChange: (roleFilter: string) => void
}

/** 계정 목록의 역할 탭. 누르면 곧바로 그 역할만 조회한다 */
export function ClientUserFilters({ roleFilter, onRoleChange }: ClientUserFiltersProps) {
  return (
    <FilterTabs
      aria-label="역할 필터"
      options={ROLE_TABS}
      value={roleFilter}
      onValueChange={onRoleChange}
    />
  )
}
