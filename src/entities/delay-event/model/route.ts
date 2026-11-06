/** 선적의 운송 수단 코드값(API 명세 v6.2 2절) */
export const TRANSPORT_MODE = {
  OCEAN: 'OCEAN',
  AIR: 'AIR',
} as const

export type TransportMode = (typeof TRANSPORT_MODE)[keyof typeof TRANSPORT_MODE]

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
