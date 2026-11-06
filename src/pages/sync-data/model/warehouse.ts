/** `warehouse.regionCode`·`customerRegion` 표시명. 서버가 새 권역을 추가해도 깨지지 않게 코드를 그대로 보여 준다. */
const REGION_LABEL: Record<string, string> = {
  WEST: '서부(LA)',
  EAST: '동부(NJ)',
  KR: '한국',
}

export const getRegionLabel = (regionCode: string) => REGION_LABEL[regionCode] ?? regionCode
