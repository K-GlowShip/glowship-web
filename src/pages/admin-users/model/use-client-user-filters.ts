import { useState } from 'react'

import { CLIENT_ROLE_CODE, type ClientRoleCode, type GetClientUsersParams } from '@/shared/api'

/** 서버의 `size` 기본값과 같다 */
const PAGE_SIZE = 20

/** 역할 필터의 "전체". 서버에는 `roleCode`를 보내지 않는다 */
export const ALL_ROLES = 'ALL'

export type RoleFilter = typeof ALL_ROLES | ClientRoleCode

const isClientRole = (value: string): value is ClientRoleCode =>
  Object.values<string>(CLIENT_ROLE_CODE).includes(value)

/**
 * 계정 목록의 고객사·역할·페이지 상태. 고객사나 역할을 바꾸면 1페이지로 돌아간다.
 * 고른 고객사가 목록에서 사라졌거나 아직 고르지 않았으면 첫 고객사로 본다.
 */
export function useClientUserFilters<T extends { companyId: string }>(companies: [T, ...T[]]) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(ALL_ROLES)
  const [page, setPage] = useState(1)

  const company = companies.find((option) => option.companyId === selectedCompanyId) ?? companies[0]

  const params: GetClientUsersParams = {
    companyId: company.companyId,
    roleCode: roleFilter === ALL_ROLES ? undefined : roleFilter,
    page,
    size: PAGE_SIZE,
  }

  return {
    company,
    roleFilter,
    page,
    params,
    onCompanyChange: (companyId: string) => {
      setSelectedCompanyId(companyId)
      setPage(1)
    },
    onRoleChange: (value: string) => {
      setRoleFilter(isClientRole(value) ? value : ALL_ROLES)
      setPage(1)
    },
    onPageChange: setPage,
  }
}
