/** 선적의 운송 수단 코드값(API 명세 v6.2 2절) */
export const TRANSPORT_MODE = {
  OCEAN: 'OCEAN',
  AIR: 'AIR',
} as const

export type TransportMode = (typeof TRANSPORT_MODE)[keyof typeof TRANSPORT_MODE]

/** 명세에 표시명이 없어 운송 단계 표시명('해상 운송'·'항공 운송')에 맞춘 제안값 */
export const TRANSPORT_MODE_LABEL: Record<TransportMode, string> = {
  [TRANSPORT_MODE.OCEAN]: '해상',
  [TRANSPORT_MODE.AIR]: '항공',
}

/** 한국 출발 항구. 인천은 항공, 부산은 해상 선적이 출발한다. */
const ORIGIN_PORT_LABEL: Record<TransportMode, string> = {
  [TRANSPORT_MODE.AIR]: '인천',
  [TRANSPORT_MODE.OCEAN]: '부산',
}

/** 경로의 출발 'KR'을 운송 수단에 맞는 출발 항구로 바꿔 보여 준다. 예: '부산 → LOS ANGELES' */
export const formatRoute = ({ route, transportMode }: { route: string; transportMode: string }) => {
  const originPort = ORIGIN_PORT_LABEL[transportMode as TransportMode]
  return originPort ? route.replace(/^KR/, originPort) : route
}
