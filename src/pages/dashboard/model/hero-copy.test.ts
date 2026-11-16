import { describe, expect, it } from 'vitest'

import type { DashboardSummary } from '@/shared/api'

import { HERO_MOOD, toHeroCopy } from './hero-copy'

// 이 테스트가 보는 필드(지연 건수)만 채운다
const summary = (delayedShipmentCount: number) =>
  ({ delayedShipmentCount, inTransitShipmentCount: 8 }) as DashboardSummary

describe('toHeroCopy', () => {
  it('지연이 있으면 건수를 강조해 확인을 부르는 문장이다', () => {
    expect(toHeroCopy(summary(2))).toEqual({
      mood: HERO_MOOD.DELAYED,
      lead: '오늘 확인할 지연이',
      highlightCount: 2,
      highlightText: '건',
      trail: ' 있어요',
    })
  })

  it('지연이 없으면 건수 없이 안심시키는 문장이다', () => {
    expect(toHeroCopy(summary(0))).toEqual({
      mood: HERO_MOOD.CLEAR,
      lead: '오늘은 모든 선적이',
      highlightCount: null,
      highlightText: '순조로워요',
      trail: '',
    })
  })
})
