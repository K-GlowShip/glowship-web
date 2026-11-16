import { env } from '@/shared/config'

export interface AssignedCompany {
  companyId: string
  companyName: string
}

/** 이름을 모를 때 보여 주는 이름 */
const UNKNOWN_COMPANY_NAME = '담당 고객사'

/**
 * 관리자가 담당하는 고객사 목록. 서버가 목록(`GET /me`의 `assignedCompanies[]`)을 내려주기 전까지는
 * 환경변수 한 곳을 돌려준다(MVP는 한 곳 담당, 명세 D7). 값이 없으면 빈 목록이다.
 * 서버가 목록을 주면 이 훅의 내용만 `GET /me` 기반으로 바꾼다.
 */
export const useAssignedCompanies = (): AssignedCompany[] =>
  env.adminCompanyId
    ? [{ companyId: env.adminCompanyId, companyName: env.adminCompanyName || UNKNOWN_COMPANY_NAME }]
    : []
