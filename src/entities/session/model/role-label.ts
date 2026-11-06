import { ROLE_CODE, type RoleCode } from '@/shared/api'

export const ROLE_LABEL: Record<RoleCode, string> = {
  [ROLE_CODE.OWNER]: '오너',
  [ROLE_CODE.ADMIN]: '관리자',
  [ROLE_CODE.CLIENT_MEMBER]: '팀원',
  [ROLE_CODE.CLIENT_LEAD]: '팀장',
}
