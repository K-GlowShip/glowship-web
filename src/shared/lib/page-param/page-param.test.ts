import { describe, expect, it } from 'vitest'

import { parsePageParam } from './page-param'

describe('parsePageParam', () => {
  it('1 이상의 정수만 쓰고 아니면 1페이지다', () => {
    expect(parsePageParam('3')).toBe(3)
    expect(parsePageParam('2.7')).toBe(2)
    expect(parsePageParam('0')).toBe(1)
    expect(parsePageParam('-4')).toBe(1)
    expect(parsePageParam('abc')).toBe(1)
    expect(parsePageParam(null)).toBe(1)
  })
})
