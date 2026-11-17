import { getStageLabel } from '@/entities/delay-event'
import {
  isApiError,
  type ScheduleObservation,
  SHIPMENT_STAGE,
  type ShipmentLine,
  TRANSPORT_MODE,
  type TransportMode,
} from '@/shared/api'

/**
 * 미국 도착 구간의 이름. 데이터 이름은 "항구"(`expectedPortArrivalDate`·`AT_PORT`)지만 항공 선적은 공항으로 도착한다.
 * 모르는 운송 수단이면 중립 표현("도착")으로 떨어진다
 */
const ARRIVAL_LEG_LABEL: Record<TransportMode, string> = {
  [TRANSPORT_MODE.OCEAN]: '항구 도착',
  [TRANSPORT_MODE.AIR]: '공항 도착',
}

const UNKNOWN_ARRIVAL_LEG_LABEL = '도착'

export const getArrivalLegLabel = (transportMode: string) =>
  ARRIVAL_LEG_LABEL[transportMode as TransportMode] ?? UNKNOWN_ARRIVAL_LEG_LABEL

/** 항공 선적의 `AT_PORT`만 공용 라벨("항구 도착·통관 중")과 다르게 보여 준다. 목록 표 등 다른 화면은 공용 라벨 그대로다 */
const AIR_AT_PORT_STAGE_LABEL = '공항 도착·통관 중'

/** 단계 이름에 운송 수단이 이미 들어 있는 단계("해상 운송"·"항공 운송"). 이때 운송 수단을 따로 또 적지 않는다 */
const STAGES_NAMING_TRANSPORT_MODE: string[] = [SHIPMENT_STAGE.AT_SEA, SHIPMENT_STAGE.IN_AIR]

export const isTransportModeInStageLabel = (stage: string) =>
  STAGES_NAMING_TRANSPORT_MODE.includes(stage)

/** 서랍 안에서 쓰는 운송 단계 표시. 운송 수단에 맞춘 "항구/공항"만 다르고 나머지는 공용 `getStageLabel`과 같다 */
export const getShipmentStageLabel = (stage: string, transportMode: string) =>
  stage === SHIPMENT_STAGE.AT_PORT && transportMode === TRANSPORT_MODE.AIR
    ? AIR_AT_PORT_STAGE_LABEL
    : getStageLabel(stage)

/** 없는 선적·다른 고객사 선적(명세 4.3 `GET /shipments/{shipmentId}` 404) */
export const SHIPMENT_NOT_FOUND = 'SHIPMENT_NOT_FOUND'

export const isShipmentNotFound = (error: unknown) =>
  isApiError(error) && error.code === SHIPMENT_NOT_FOUND

/** 시장 리드타임 신뢰도. 원천 값이라 명세에 목록이 없어, 자주 오는 값만 한글로 보여 주고 나머지는 그대로 둔다 */
export const LEADTIME_CONFIDENCE = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

type LeadtimeConfidence = (typeof LEADTIME_CONFIDENCE)[keyof typeof LEADTIME_CONFIDENCE]

const LEADTIME_CONFIDENCE_LABEL: Record<LeadtimeConfidence, string> = {
  [LEADTIME_CONFIDENCE.LOW]: '낮음',
  [LEADTIME_CONFIDENCE.MEDIUM]: '보통',
  [LEADTIME_CONFIDENCE.HIGH]: '높음',
}

export const getLeadtimeConfidenceLabel = (confidence: string) =>
  LEADTIME_CONFIDENCE_LABEL[confidence.toLowerCase() as LeadtimeConfidence] ?? confidence

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MS_PER_DAY = 86_400_000

const parseDate = (date: string | null) => {
  if (!date || !DATE_PATTERN.test(date)) {
    return null
  }
  const time = Date.parse(`${date}T00:00:00Z`)
  return Number.isNaN(time) ? null : time
}

/**
 * `YYYY-MM-DD` 두 날짜의 차이(일). `to`가 `from`보다 늦으면 양수다.
 * 어느 쪽이든 없거나 형식이 다르면 null.
 */
export const diffDays = (from: string | null, to: string | null) => {
  const fromTime = parseDate(from)
  const toTime = parseDate(to)
  if (fromTime === null || toTime === null) {
    return null
  }
  return Math.round((toTime - fromTime) / MS_PER_DAY)
}

/** 날짜 차이를 부호와 함께. 예: 4 -> '+4일', -2 -> '-2일'. 0이면 null(바뀐 게 없으니 표시하지 않는다) */
export const formatSignedDays = (days: number | null) => {
  if (days === null || days === 0) {
    return null
  }
  return `${days > 0 ? '+' : '-'}${Math.abs(days)}일`
}

/** 일정 관측 한 건에 직전 관측 대비 변화(일)를 붙인 것 */
export interface ScheduleChange {
  observation: ScheduleObservation
  /** 직전 관측 대비 예상 항구 도착일 변화. 첫 관측이거나 어느 한쪽이 없으면 null */
  portArrivalShiftDays: number | null
  /** 직전 관측 대비 예상 3PL 입고일 변화. 첫 관측이면 null */
  inboundShiftDays: number | null
}

/** 서버가 준 순서(오래된 순) 그대로, 각 관측이 직전 관측에서 며칠 늦춰지거나 당겨졌는지 계산한다 */
export const toScheduleChanges = (history: readonly ScheduleObservation[]): ScheduleChange[] =>
  history.map((observation, index) => {
    const previous = index > 0 ? history[index - 1] : null
    return {
      observation,
      portArrivalShiftDays: previous
        ? diffDays(previous.expectedPortArrivalDate, observation.expectedPortArrivalDate)
        : null,
      inboundShiftDays: previous
        ? diffDays(previous.expected3plInboundDate, observation.expected3plInboundDate)
        : null,
    }
  })

export const getTotalShippedQuantity = (lines: readonly ShipmentLine[]) =>
  lines.reduce((sum, line) => sum + line.shippedQuantity, 0)
