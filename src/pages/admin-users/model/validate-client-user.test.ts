import { describe, expect, it } from 'vitest'

import { CLIENT_ROLE_CODE } from '@/shared/api'

import { CLIENT_USER_ERROR } from './client-user-text'
import { type ClientUserFormValues, validateClientUser } from './validate-client-user'

const valid: ClientUserFormValues = {
  email: 'lead@client.com',
  password: 'password123',
  roleCode: CLIENT_ROLE_CODE.CLIENT_LEAD,
  displayName: '홍길동',
}

describe('validateClientUser', () => {
  it('모두 올바르면 오류가 없다', () => {
    expect(validateClientUser(valid)).toEqual({})
  })

  it.each(['', '   '])('이름은 필수라서 "%s"은 오류다', (displayName) => {
    expect(validateClientUser({ ...valid, displayName }).displayName).toBe(
      CLIENT_USER_ERROR.DISPLAY_NAME_REQUIRED,
    )
  })

  it('이름은 앞뒤 공백을 빼고 검사한다', () => {
    expect(validateClientUser({ ...valid, displayName: ' 홍길동 ' })).toEqual({})
    expect(validateClientUser({ ...valid, displayName: `${'가'.repeat(50)} ` })).toEqual({})
  })

  it('이메일은 앞뒤 공백을 빼고 검사한다', () => {
    expect(validateClientUser({ ...valid, email: ' lead@client.com ' })).toEqual({})
  })

  it.each([
    ['', CLIENT_USER_ERROR.EMAIL_REQUIRED],
    ['   ', CLIENT_USER_ERROR.EMAIL_REQUIRED],
    ['not-an-email', CLIENT_USER_ERROR.EMAIL_INVALID],
    ['a@b', CLIENT_USER_ERROR.EMAIL_INVALID],
    [`${'a'.repeat(45)}@b.com`, CLIENT_USER_ERROR.EMAIL_TOO_LONG],
  ])('이메일 "%s"은 오류다', (email, message) => {
    expect(validateClientUser({ ...valid, email }).email).toBe(message)
  })

  it.each([
    ['', CLIENT_USER_ERROR.PASSWORD_REQUIRED],
    ['abc12', CLIENT_USER_ERROR.PASSWORD_INVALID],
    ['a'.repeat(17), CLIENT_USER_ERROR.PASSWORD_INVALID],
    ['pass word1', CLIENT_USER_ERROR.PASSWORD_INVALID],
    ['pass!word1', CLIENT_USER_ERROR.PASSWORD_INVALID],
    ['비밀번호123456', CLIENT_USER_ERROR.PASSWORD_INVALID],
  ])('비밀번호 "%s"은 오류다', (password, message) => {
    expect(validateClientUser({ ...valid, password }).password).toBe(message)
  })

  it('비밀번호는 영문·숫자 6~16자면 통과한다', () => {
    expect(validateClientUser({ ...valid, password: 'abc123' })).toEqual({})
    expect(validateClientUser({ ...valid, password: 'a1b2c3d4e5f6g7h8' })).toEqual({})
  })

  it('이름이 50자를 넘으면 오류다', () => {
    expect(validateClientUser({ ...valid, displayName: '가'.repeat(51) }).displayName).toBe(
      CLIENT_USER_ERROR.DISPLAY_NAME_TOO_LONG,
    )
  })
})
