import { STAGE_CODE, type StageCode } from './stage'

/**
 * 선적 여정에 표시하는 정거장. 운송 단계(명세 2절)를 진행 순서대로 놓았다.
 * 해상·항공 운송은 같은 자리이고, 어느 쪽인지는 운송 수단 아이콘이 알려 준다.
 */
export const VOYAGE_STEPS: readonly { label: string; stages: readonly StageCode[] }[] = [
  { label: '출항 전', stages: [STAGE_CODE.PRE_DEPARTURE] },
  { label: '운송 중', stages: [STAGE_CODE.AT_SEA, STAGE_CODE.IN_AIR] },
  { label: '항구 도착·통관', stages: [STAGE_CODE.AT_PORT] },
  { label: '입고 완료', stages: [STAGE_CODE.RECEIVED] },
]

/** 운송 중(해상·항공) 정거장의 순서. 이 자리에 있는 선적만 움직이는 표시를 한다 */
export const VOYAGE_IN_TRANSIT_STEP_INDEX = 1

/** 운송 단계가 여정의 몇 번째 정거장인지. 서버가 새 단계를 추가해 알 수 없으면 null */
export const getVoyageStepIndex = (stage: string) => {
  const index = VOYAGE_STEPS.findIndex(({ stages }) => stages.includes(stage as StageCode))
  return index === -1 ? null : index
}

const ROUTE_SEPARATOR = ' → '

/** 경로 문자열('부산 → LOS ANGELES')을 출발지와 도착지로 나눈다. 모양이 다르면 null */
export const splitRoute = (route: string) => {
  const parts = route.split(ROUTE_SEPARATOR)
  return parts.length === 2 ? { origin: parts[0], destination: parts[1] } : null
}

const LAST_STEP_INDEX = VOYAGE_STEPS.length - 1

/** 정거장의 가로 위치(%) */
export const toStepPosition = (index: number) => `${(index / LAST_STEP_INDEX) * 100}%`

/** 정거장 아래 글자를 어디에 맞출지. 양 끝 정거장은 바깥쪽, 나머지는 가운데 */
export const STEP_ALIGN = {
  START: 'START',
  MIDDLE: 'MIDDLE',
  END: 'END',
} as const

export type StepAlign = (typeof STEP_ALIGN)[keyof typeof STEP_ALIGN]

export const getStepAlign = (stepIndex: number): StepAlign =>
  stepIndex === 0
    ? STEP_ALIGN.START
    : stepIndex === LAST_STEP_INDEX
      ? STEP_ALIGN.END
      : STEP_ALIGN.MIDDLE
