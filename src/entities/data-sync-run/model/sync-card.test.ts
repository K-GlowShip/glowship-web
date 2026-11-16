import { describe, expect, it } from 'vitest'

import { getNewestSyncedAt } from './sync-card'

describe('getNewestSyncedAt', () => {
  it('가장 최근 시각을 돌려준다', () => {
    expect(
      getNewestSyncedAt([
        '2026-07-03T00:00:00Z',
        null,
        '2026-07-04T01:00:00Z',
        '2026-07-01T00:00:00Z',
      ]),
    ).toBe('2026-07-04T01:00:00Z')
  })

  it('값이 없거나 모두 null이면 null이다', () => {
    expect(getNewestSyncedAt([])).toBeNull()
    expect(getNewestSyncedAt([null, null])).toBeNull()
  })
})
