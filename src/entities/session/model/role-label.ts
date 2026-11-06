import { ROLE_CODE, type RoleCode } from '@/shared/api'

export const ROLE_LABEL: Record<RoleCode, string> = {
  [ROLE_CODE.OWNER]: '오너',
  [ROLE_CODE.ADMIN]: '관리자',
  [ROLE_CODE.CLIENT_MEMBER]: '팀원',
  [ROLE_CODE.CLIENT_LEAD]: '팀장',
}

/** 서버가 새 역할 코드를 추가해도 화면이 깨지지 않게, 라벨이 없으면 코드를 그대로 보여 준다. */
export const getRoleLabel = (roleCode: string) => ROLE_LABEL[roleCode as RoleCode] ?? roleCode
