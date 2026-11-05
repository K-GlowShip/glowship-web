/** 창고의 권역 코드값(API 명세 v6.2 `GET /warehouses`의 `regionCode`) */
export const REGION_CODE = {
  KR: 'KR',
  WEST: 'WEST',
  EAST: 'EAST',
} as const

export type RegionCode = (typeof REGION_CODE)[keyof typeof REGION_CODE]

/** 명세 2절 "코드값 → 화면 표시명" */
export const REGION_LABEL: Record<RegionCode, string> = {
  [REGION_CODE.KR]: '한국',
  [REGION_CODE.WEST]: '서부(LA)',
  [REGION_CODE.EAST]: '동부(NJ)',
}
