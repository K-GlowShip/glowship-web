import { ROLE_CODE } from '@/shared/api'

/**
 * Glowship 내부 계정(`OWNER`·`ADMIN`)인지. 고객사 소속이 없어서 고객사 화면 대신 관리 화면을 쓴다.
 * 내 계정(`GET /me`)이 없는 데모 세션은 내부 계정이 아니다.
 */
export const isInternalRole = (roleCode: string | undefined) =>
  roleCode === ROLE_CODE.OWNER || roleCode === ROLE_CODE.ADMIN
