import type { DashboardSummary } from '@/shared/api'

/** 오늘 상황의 분위기. 지연이 있으면 확인을 부르고, 없으면 안심시킨다 */
export const HERO_MOOD = {
  DELAYED: 'DELAYED',
  CLEAR: 'CLEAR',
} as const

export type HeroMood = (typeof HERO_MOOD)[keyof typeof HERO_MOOD]

/** 대시보드 요약 맨 위의 한 문장. 강조 부분(숫자나 핵심어)만 색을 달리한다 */
export interface HeroCopy {
  mood: HeroMood
  /** 강조 앞. 넓은 화면에서는 이 뒤에서 줄을 바꾼다 */
  lead: string
  /** 강조할 건수. 숫자가 아닌 말(순조로워요)을 강조할 때는 null */
  highlightCount: number | null
  /** 강조 글자. 건수를 강조할 때는 단위('건') */
  highlightText: string
  /** 강조 뒤 */
  trail: string
}

/** 요약(`GET /dashboard/summary`)의 지연 건수로 오늘의 한 문장을 만든다 */
export const toHeroCopy = (summary: DashboardSummary): HeroCopy => {
  const { delayedShipmentCount } = summary

  if (delayedShipmentCount > 0) {
    return {
      mood: HERO_MOOD.DELAYED,
      lead: '오늘 확인할 지연이',
      highlightCount: delayedShipmentCount,
      highlightText: '건',
      trail: ' 있어요',
    }
  }
  return {
    mood: HERO_MOOD.CLEAR,
    lead: '오늘은 모든 선적이',
    highlightCount: null,
    highlightText: '순조로워요',
    trail: '',
  }
}
