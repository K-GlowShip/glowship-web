import { USER_STATUS, type UserStatus } from '@/shared/api'

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  [USER_STATUS.ACTIVE]: '사용 중',
  [USER_STATUS.DISABLED]: '비활성',
}

export const USER_STATUS_BADGE_VARIANT = {
  [USER_STATUS.ACTIVE]: 'success',
  [USER_STATUS.DISABLED]: 'neutral',
} as const satisfies Record<UserStatus, 'success' | 'neutral'>

/** 서버가 새 상태를 추가해도 화면이 깨지지 않게, 라벨이 없으면 코드를 그대로 보여 준다 */
export const getUserStatusLabel = (status: string) =>
  USER_STATUS_LABEL[status as UserStatus] ?? status
