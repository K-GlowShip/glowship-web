import { describe, expect, it } from 'vitest'

import { isSameHistoryFilter, parseHistoryFilter, toHistoryParams } from './history'

const parse = (search: string) => parseHistoryFilter(new URLSearchParams(search))

describe('이력 조회 조건과 주소', () => {
  it('주소에서 기간·검색어·상태를 읽는다', () => {
    expect(parse('start=2026-07-01&end=2026-07-03&q=PORT&status=FINAL')).toEqual({
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      keyword: 'PORT',
      status: 'FINAL',
    })
  })

  it('주소가 비어 있으면 아무것도 고르지 않은 상태다', () => {
    expect(parse('')).toEqual({ startDate: '', endDate: '', keyword: '', status: '' })
  })

  it('알 수 없는 상태나 실제로 없는 날짜는 비운 것으로 본다', () => {
    expect(parse('status=HACKED&start=2026-02-30&end=abc')).toEqual({
      startDate: '',
      endDate: '',
      keyword: '',
      status: '',
    })
  })

  it('조건을 주소로 바꿀 때 비어 있는 값과 1페이지는 싣지 않는다', () => {
    const params = toHistoryParams(
      { startDate: '', endDate: '2026-07-03', keyword: ' PORT ', status: '' },
      1,
    )

    expect(params.toString()).toBe('end=2026-07-03&q=PORT')
    expect(
      toHistoryParams({ startDate: '', endDate: '', keyword: '', status: 'DRAFT' }, 2).toString(),
    ).toBe('status=DRAFT&page=2')
  })

  it('같은 조건인지 필드 값으로 비교한다', () => {
    const filter = {
      startDate: '2026-07-01',
      endDate: '',
      keyword: 'PORT',
      status: 'FINAL',
    } as const

    expect(isSameHistoryFilter(filter, { ...filter })).toBe(true)
    expect(isSameHistoryFilter(filter, { ...filter, keyword: 'SEA' })).toBe(false)
    expect(isSameHistoryFilter(filter, { ...filter, status: '' })).toBe(false)
  })
})
