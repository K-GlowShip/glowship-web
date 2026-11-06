import { API } from '../fetcher'
import { ENDPOINT } from '../paths'

export const ROLE_CODE = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  CLIENT_MEMBER: 'CLIENT_MEMBER',
  CLIENT_LEAD: 'CLIENT_LEAD',
} as const

export type RoleCode = (typeof ROLE_CODE)[keyof typeof ROLE_CODE]

export interface Me {
  userId: string
  displayName: string
  roleCode: RoleCode
  /** OWNER·ADMIN은 고객사가 없어 null */
  companyId: string | null
  companyName: string | null
}

/** 내 계정을 조회한다. 쿠키가 없거나 만료되면 401이다. */
export const getMe = () => API.get<Me>(ENDPOINT.ME)
