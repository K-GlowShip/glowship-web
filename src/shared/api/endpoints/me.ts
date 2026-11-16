import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import { ENDPOINT } from '../paths'

export const ROLE_CODE = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  CLIENT_MEMBER: 'CLIENT_MEMBER',
  CLIENT_LEAD: 'CLIENT_LEAD',
} as const

export type RoleCode = (typeof ROLE_CODE)[keyof typeof ROLE_CODE]

/** 관리자가 고를 수 있는 고객사. 계정 관리 권한이 없으면 목록 조회만 된다(명세 D25) */
export interface AssignedCompany {
  companyId: string
  companyName: string
  canManageClientAccounts: boolean
}

export interface Me {
  userId: string
  displayName: string
  roleCode: RoleCode
  /** OWNER·ADMIN은 고객사가 없어 null */
  companyId: string | null
  companyName: string | null
  /** ADMIN은 담당 고객사, OWNER는 전체 고객사. 고객사 계정(Client)과 담당이 없는 ADMIN은 빈 배열 */
  assignedCompanies: AssignedCompany[]
}

/** 서버가 `assignedCompanies`를 아직 주지 않아도 화면은 빈 목록으로 다룬다 */
type MeResponse = Omit<Me, 'assignedCompanies'> & { assignedCompanies?: AssignedCompany[] | null }

/** 내 계정을 조회한다. 쿠키가 없거나 만료되면 401이다. */
export const getMe = async (config?: AxiosRequestConfig): Promise<Me> => {
  const me = await API.get<MeResponse>(ENDPOINT.ME, config)
  return { ...me, assignedCompanies: me.assignedCompanies ?? [] }
}
