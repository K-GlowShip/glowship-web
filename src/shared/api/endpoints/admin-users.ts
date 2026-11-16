import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import { ROLE_CODE } from './me'

/** 관리자가 만들 수 있는 고객사 계정의 역할. 팀원 또는 팀장만 허용한다 */
export const CLIENT_ROLE_CODE = {
  CLIENT_MEMBER: ROLE_CODE.CLIENT_MEMBER,
  CLIENT_LEAD: ROLE_CODE.CLIENT_LEAD,
} as const

export type ClientRoleCode = (typeof CLIENT_ROLE_CODE)[keyof typeof CLIENT_ROLE_CODE]

export interface CreateClientUserRequest {
  /** 계정을 만들 고객사. 요청자가 배정된 고객사여야 한다 */
  companyId: string
  /** 50자 이하. 서버가 소문자로 저장한다 */
  email: string
  /** Base64로 인코딩한 초기 비밀번호. 디코딩하면 영문·숫자 6~16자다 */
  password: string
  roleCode: ClientRoleCode
  /** 1~50자. 생략하면 서버가 이메일을 쓴다 */
  displayName?: string
}

export interface CreatedClientUser {
  userId: string
  companyId: string
  email: string
  displayName: string
  roleCode: string
  status: string
  createdAt: string
}

/**
 * 담당 고객사에 팀원·팀장 계정을 만든다(`POST /admin/users`, 명세 4.1, 201). 관리자(`ADMIN`)만 호출할 수 있고,
 * 그 고객사에 배정돼 있으며 계정 관리 권한이 있어야 한다. 이 API는 고객사를 본문(`companyId`)으로 받는 예외다.
 */
export const createClientUser = (body: CreateClientUserRequest) =>
  API.post<CreatedClientUser, CreateClientUserRequest>(ENDPOINT.ADMIN.USERS, body)

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

/** 고객사 계정 목록의 한 행 */
export interface ClientUser {
  userId: string
  email: string
  displayName: string
  roleCode: ClientRoleCode
  status: UserStatus
  createdAt: string
}

export interface GetClientUsersParams extends PageParams {
  /** 필수. 요청자가 배정된 고객사 */
  companyId: string
  roleCode?: ClientRoleCode
  status?: UserStatus
}

/**
 * 고객사의 Client 계정 목록(`GET /admin/users`, 명세 4.1). 생성 시각 내림차순이다.
 * 관리자(`ADMIN`)만 호출할 수 있고, 미배정 고객사는 403 `FORBIDDEN`이다.
 */
export const getClientUsers = (params: GetClientUsersParams, config?: AxiosRequestConfig) =>
  API.get<Page<ClientUser>>(ENDPOINT.ADMIN.USERS, { ...config, params })
