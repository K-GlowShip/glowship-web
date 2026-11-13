import { TRANSPORT_MODE_LABEL, type TransportMode } from '@/entities/delay-event'
import {
  ANALYSIS_RUN_STATUS,
  SHIPMENT_STAGE,
  TRANSPORT_MODE,
  type DelayEventListItem,
  type Page,
  type Shipment,
} from '@/shared/api'

/**
 * 대시보드 요약의 양식화된 항로 지도.
 * 그림(항구·항로 호·호 위의 점)은 정적 장식이다. 서버 응답(명세 D13)에는 항구 좌표도 선적의 현재 위치도
 * 없으므로 실제 선적으로 매일 바뀌는 그림을 그리지 않고, 고정 항구 네 곳과 고정 호 두 개를 늘 같은 모양으로
 * 그린다. 자리는 투영이 아니라 그림 좌표계에 직접 잡은 고정값이다. 실제 데이터는 지도 아래
 * 범례(운송 수단별 진행 중 건수와 확인이 필요한 지연 건수)뿐이다.
 */

/** 지도 그림의 좌표계(viewBox). 왼쪽이 한국, 오른쪽이 미국 */
export const ROUTE_MAP_WIDTH = 900
export const ROUTE_MAP_HEIGHT = 300

/** 범례 건수를 셀 목록(선적·지연 이벤트)을 한 번에 받는 수(서버 최대). 그 이상은 건수에 빠진다 */
export const ROUTE_MAP_FETCH_SIZE = 100

/** 지도와 범례에 쓰는 항구 코드. 한글·영문 지명을 섞지 않고 공항·항만 코드로 통일한다 */
const PORT_CODE = {
  BUSAN: 'PUS',
  INCHEON: 'ICN',
  LOS_ANGELES: 'LAX',
  NEWARK: 'EWR',
} as const

interface MapPoint {
  x: number
  y: number
}

/** 지도 위 고정 항구. 출발 항구는 이름을 점 왼쪽에, 도착 항구는 점 아래에 쓴다 */
interface MapPort {
  name: string
  at: MapPoint
  isOrigin: boolean
}

/** 한국 두 항구는 왼쪽 가운데, 미국 서부는 가운데 오른쪽, 동부는 오른쪽 끝 */
const MAP_PORT = {
  INCHEON: { name: PORT_CODE.INCHEON, at: { x: 152, y: 166 }, isOrigin: true },
  BUSAN: { name: PORT_CODE.BUSAN, at: { x: 170, y: 190 }, isOrigin: true },
  LOS_ANGELES: { name: PORT_CODE.LOS_ANGELES, at: { x: 704, y: 188 }, isOrigin: false },
  NEWARK: { name: PORT_CODE.NEWARK, at: { x: 858, y: 134 }, isOrigin: false },
} as const satisfies Record<string, MapPort>

/** 지도에 그리는 고정 항구 */
export const MAP_PORTS: MapPort[] = Object.values(MAP_PORT)

/** 호 위의 장식 점. `t`는 호 위 위치(0 출발, 1 도착), `delayed`는 붉은 강조 */
interface ArcMarkSpec {
  t: number
  delayed?: boolean
}

interface MapArcSpec {
  transportMode: TransportMode
  from: MapPort
  to: MapPort
  /** 호의 높이. 항공은 더 높이 떠서 해상과 겹치지 않는다 */
  lift: number
  marks: readonly ArcMarkSpec[]
  /** 호를 따라 흐르는 빛 점이 출발 항구에서 도착 항구까지 한 번 가는 시간 */
  sparkDurationSeconds: number
}

/**
 * 해상 빛 점이 한 번 가는 시간. 항공은 비행기가 배보다 빠르다는 뜻으로 1.2배 빠르게 간다(24s → 20s).
 * 두 점 모두 각자의 출발 항구에서 같이 출발한다(시작 위상 조정 없음). 경로와 주기가 달라 겹쳐 보이지 않는다
 */
const OCEAN_SPARK_DURATION_SECONDS = 24
const AIR_SPARK_SPEED_RATIO = 1.2
const AIR_SPARK_DURATION_SECONDS = OCEAN_SPARK_DURATION_SECONDS / AIR_SPARK_SPEED_RATIO

/**
 * 고정 호: 해상 PUS→LAX, 항공 ICN→EWR.
 * 점은 실제 배·비행기처럼 간격이 들쭉날쭉하게 둔다(같은 간격이 반복되면 기계적으로 보인다). 해상은 중반에 두 점이
 * 가깝고 뒤가 길게 비며, 항공은 출발 쪽에 두 점이 가깝고 뒤로 넓게 퍼진다. 양 끝은 항구 점·이름과 겹치지 않게
 * 비우고(출발 0.09 이상, 도착 0.10 이상), 붉은 점은 호마다 하나씩 두 개만 두되 이웃과 0.07 이상 떨어뜨린다
 */
const MAP_ARC_SPEC: readonly MapArcSpec[] = [
  {
    transportMode: TRANSPORT_MODE.OCEAN,
    from: MAP_PORT.BUSAN,
    to: MAP_PORT.LOS_ANGELES,
    lift: 96,
    marks: [{ t: 0.09 }, { t: 0.3, delayed: true }, { t: 0.37 }, { t: 0.76 }],
    sparkDurationSeconds: OCEAN_SPARK_DURATION_SECONDS,
  },
  {
    transportMode: TRANSPORT_MODE.AIR,
    from: MAP_PORT.INCHEON,
    to: MAP_PORT.NEWARK,
    lift: 150,
    marks: [{ t: 0.14 }, { t: 0.22 }, { t: 0.52, delayed: true }, { t: 0.88 }],
    sparkDurationSeconds: AIR_SPARK_DURATION_SECONDS,
  },
]

/** 범례에 쓰는 운송 수단별 대표 항로. 지도의 고정 호와 같은 항구라 응답의 `route` 문자열 대신 고정값이다 */
const TRANSPORT_ROUTE_LABEL: Record<string, string> = Object.fromEntries(
  MAP_ARC_SPEC.map(({ transportMode, from, to }) => [transportMode, `${from.name} → ${to.name}`]),
)

interface ArcMark {
  at: MapPoint
  delayed: boolean
}

interface MapArc {
  transportMode: TransportMode
  /** SVG path `d` */
  path: string
  marks: ArcMark[]
  sparkDurationSeconds: number
}

/** 2차 베지어 곡선 위의 점 */
const pointOnArc = (from: MapPoint, control: MapPoint, to: MapPoint, t: number): MapPoint => {
  const u = 1 - t
  return {
    x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
  }
}

const toMapArc = ({
  transportMode,
  from,
  to,
  lift,
  marks,
  sparkDurationSeconds,
}: MapArcSpec): MapArc => {
  const control = { x: (from.at.x + to.at.x) / 2, y: Math.min(from.at.y, to.at.y) - lift }
  return {
    transportMode,
    path: `M ${from.at.x} ${from.at.y} Q ${control.x} ${control.y} ${to.at.x} ${to.at.y}`,
    marks: marks.map(({ t, delayed = false }) => ({
      at: pointOnArc(from.at, control, to.at, t),
      delayed,
    })),
    sparkDurationSeconds,
  }
}

/** 지도에 그리는 고정 호 */
export const MAP_ARCS: MapArc[] = MAP_ARC_SPEC.map(toMapArc)

/** 범례 한 줄: 운송 수단별 진행 중 건수와 확인이 필요한 지연 건수(실제 데이터) */
interface TransportSummary {
  transportMode: string
  /** 예: `해상` */
  label: string
  /** 입고 전 선적 수 */
  count: number
  /**
   * 아직 종료되지 않았고 최종 선택도 안 된 지연 이벤트 수. 요약의 `delayedShipmentCount`와 같은 기준이다.
   * 지연 이벤트 목록을 아직 못 받았으면 null
   */
  needsReviewCount: number | null
  /** 지도의 고정 호와 같은 대표 항로. 예: `PUS → LAX`. 표에 없는 수단은 빈 문자열 */
  route: string
}

/** 범례의 운송 수단 순서. 해상이 먼저, 표에 없는 수단은 뒤에 응답 순서대로 */
const TRANSPORT_ORDER: string[] = [TRANSPORT_MODE.OCEAN, TRANSPORT_MODE.AIR]

/**
 * 목록을 빠짐없이 받았는가. 서버가 한 번에 주는 최대 수를 넘는 선적·이벤트가 있으면 첫 페이지만으로는
 * 건수가 틀리므로, 범례는 틀린 숫자를 보이지 않고 비운다
 */
export const isFullyFetched = (page: Pick<Page<unknown>, 'items' | 'totalCount'>) =>
  page.totalCount <= page.items.length

/** 입고 전 선적만 센다 */
const isOnTheWay = (shipment: Shipment) => shipment.stage !== SHIPMENT_STAGE.RECEIVED

/**
 * 확인이 필요한 지연: 아직 종료되지 않았고(`closedAt` 없음), 최종 선택 전이며, 현재 실행이 '지연 아님'으로
 * 끝나지 않은 이벤트. 요약(`GET /dashboard/summary`)의 지연 선적 수와 같은 기준이다
 */
const needsReview = (event: DelayEventListItem) =>
  event.closedAt === null &&
  !event.hasFinalDecision &&
  event.currentRun?.status !== ANALYSIS_RUN_STATUS.NO_DELAY

const countBy = <T>(items: T[], keyOf: (item: T) => string) => {
  const counts = new Map<string, number>()
  for (const item of items) {
    const key = keyOf(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

/**
 * 선적 목록과 지연 이벤트 목록을 운송 수단별로 묶어 범례 건수를 센다. 항구가 늘어도 범례는 해상·항공 두 줄로
 * 안정적이다. 지연 이벤트 목록이 아직 없으면(`null`) 확인 필요 건수만 비운다
 */
export const toTransportSummaries = (
  shipments: Shipment[],
  delayEvents: DelayEventListItem[] | null,
): TransportSummary[] => {
  const counts = countBy(shipments.filter(isOnTheWay), (shipment) => shipment.transportMode)
  const reviewCounts = delayEvents
    ? countBy(delayEvents.filter(needsReview), (event) => event.transportMode)
    : null

  return [...counts.entries()]
    .map(([transportMode, count]): TransportSummary => ({
      transportMode,
      label: TRANSPORT_MODE_LABEL[transportMode as TransportMode] ?? transportMode,
      count,
      needsReviewCount: reviewCounts ? (reviewCounts.get(transportMode) ?? 0) : null,
      route: TRANSPORT_ROUTE_LABEL[transportMode] ?? '',
    }))
    .sort((a, b) => {
      const ai = TRANSPORT_ORDER.indexOf(a.transportMode)
      const bi = TRANSPORT_ORDER.indexOf(b.transportMode)
      return (ai === -1 ? TRANSPORT_ORDER.length : ai) - (bi === -1 ? TRANSPORT_ORDER.length : bi)
    })
}
