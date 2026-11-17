import { describe, expect, it } from 'vitest'

import { ROLE_CODE } from '@/shared/api'

import { isInternalRole } from './role'

describe('isInternalRole', () => {
  it('오너와 관리자는 내부 계정이다', () => {
    expect(isInternalRole(ROLE_CODE.OWNER)).toBe(true)
    expect(isInternalRole(ROLE_CODE.ADMIN)).toBe(true)
  })

  it('고객사 팀원·팀장과 내 계정이 없는 데모 세션은 내부 계정이 아니다', () => {
    expect(isInternalRole(ROLE_CODE.CLIENT_MEMBER)).toBe(false)
    expect(isInternalRole(ROLE_CODE.CLIENT_LEAD)).toBe(false)
    expect(isInternalRole(undefined)).toBe(false)
  })
})
