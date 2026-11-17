import { LEAD_TIME_TYPE, type LeadTime, type LeadTimeType } from '@/shared/api'

export const LEAD_TIME_TYPE_LABEL: Record<LeadTimeType, string> = {
  [LEAD_TIME_TYPE.CUSTOMER_DELIVERY]: '고객 배송',
  [LEAD_TIME_TYPE.AIR_TRANSIT]: '항공 운송',
  [LEAD_TIME_TYPE.INBOUND_HANDLING]: '입고 처리',
  [LEAD_TIME_TYPE.OUTBOUND_HANDLING]: '출고 처리',
}

const REGION_LABEL: Record<string, string> = { KR: '한국', WEST: '서부', EAST: '동부' }

/** 서버가 새 코드를 추가해도 화면이 깨지지 않게, 라벨이 없으면 코드를 그대로 보여 준다 */
const getRegionLabel = (regionCode: string) => REGION_LABEL[regionCode] ?? regionCode

/** 리드타임이 가리키는 구간. 예: "WH-KR → 동부", 도착 권역이 없으면 "WH-KR" */
export const getLeadTimeRoute = ({ warehouse, toRegionCode }: LeadTime) =>
  toRegionCode
    ? `${warehouse.warehouseCode} → ${getRegionLabel(toRegionCode)}`
    : warehouse.warehouseCode

/** 리드타임 하나의 전체 이름. 표의 칸을 스크린리더에 알릴 때 쓴다. 예: "항공 운송 WH-KR → 동부" */
export const getLeadTimeName = (leadTime: LeadTime) =>
  `${LEAD_TIME_TYPE_LABEL[leadTime.leadTimeType] ?? leadTime.leadTimeType} ${getLeadTimeRoute(leadTime)}`

/** 표의 한 칸. `index`는 서버가 준 리드타임 목록에서의 순서다(폼 값과 짝을 맞추는 데 쓴다) */
export interface LeadTimeCell {
  index: number
  leadTime: LeadTime
}

/** 리드타임을 창고(행) × 도착 권역 또는 처리 종류(열)로 놓은 표 하나 */
export interface LeadTimeMatrix {
  key: string
  title: string
  columns: { key: string; label: string }[]
  rows: { warehouse: LeadTime['warehouse']; cells: (LeadTimeCell | undefined)[] }[]
}

const HANDLING_COLUMN_LABEL: Partial<Record<LeadTimeType, string>> = {
  [LEAD_TIME_TYPE.INBOUND_HANDLING]: '입고',
  [LEAD_TIME_TYPE.OUTBOUND_HANDLING]: '출고',
}

const getTypeLabel = (leadTimeType: LeadTimeType) =>
  LEAD_TIME_TYPE_LABEL[leadTimeType] ?? leadTimeType

type Column = LeadTimeMatrix['columns'][number]

/** 칸들을 창고별 행으로 모은다. 열은 처음 나온 순서, 행은 창고 코드 순이다 */
const buildMatrix = (
  key: string,
  title: string,
  cells: LeadTimeCell[],
  toColumn: (leadTime: LeadTime) => Column,
): LeadTimeMatrix => {
  const columns: Column[] = []
  const rows = new Map<
    string,
    { warehouse: LeadTime['warehouse']; byColumn: Map<string, LeadTimeCell> }
  >()

  for (const cell of cells) {
    const column = toColumn(cell.leadTime)
    if (!columns.some(({ key: columnKey }) => columnKey === column.key)) {
      columns.push(column)
    }
    const { warehouse } = cell.leadTime
    const row = rows.get(warehouse.warehouseId) ?? { warehouse, byColumn: new Map() }
    row.byColumn.set(column.key, cell)
    rows.set(warehouse.warehouseId, row)
  }

  return {
    key,
    title,
    columns,
    // 여러 유형을 합친 표("창고 처리")에서도 창고가 코드 순으로 보이게 한다
    rows: [...rows.values()]
      .sort((a, b) => a.warehouse.warehouseCode.localeCompare(b.warehouse.warehouseCode))
      .map(({ warehouse, byColumn }) => ({
        warehouse,
        cells: columns.map((column) => byColumn.get(column.key)),
      })),
  }
}

/**
 * 리드타임 목록을 읽기 쉬운 표 묶음으로 바꾼다. 한 줄씩 나열하면 유형과 창고 이름이 줄마다 반복되기 때문이다.
 * - 도착 권역이 있는 유형(고객 배송·항공 운송)은 유형마다 표 하나: 행은 창고, 열은 도착 권역
 * - 도착 권역이 없는 유형(입고·출고 처리)은 "창고 처리" 표 하나로 합친다: 행은 창고, 열은 처리 종류
 */
export const toLeadTimeMatrices = (leadTimes: LeadTime[]): LeadTimeMatrix[] => {
  const cells = leadTimes.map((leadTime, index) => ({ index, leadTime }))
  const routeCells = cells.filter(({ leadTime }) => leadTime.toRegionCode)
  const handlingCells = cells.filter(({ leadTime }) => !leadTime.toRegionCode)
  const routeTypes = [...new Set(routeCells.map(({ leadTime }) => leadTime.leadTimeType))]

  const matrices = routeTypes.map((leadTimeType) =>
    buildMatrix(
      leadTimeType,
      getTypeLabel(leadTimeType),
      routeCells.filter(({ leadTime }) => leadTime.leadTimeType === leadTimeType),
      ({ toRegionCode }) => ({
        key: toRegionCode ?? '',
        label: `→ ${getRegionLabel(toRegionCode ?? '')}`,
      }),
    ),
  )
  if (handlingCells.length > 0) {
    matrices.push(
      buildMatrix('HANDLING', '창고 처리', handlingCells, ({ leadTimeType }) => ({
        key: leadTimeType,
        label: HANDLING_COLUMN_LABEL[leadTimeType] ?? getTypeLabel(leadTimeType),
      })),
    )
  }
  return matrices
}

export const PARTIAL_POLICY = {
  ALLOWED: 'ALLOWED',
  NOT_ALLOWED: 'NOT_ALLOWED',
  UNDECIDED: 'UNDECIDED',
} as const

export type PartialPolicy = (typeof PARTIAL_POLICY)[keyof typeof PARTIAL_POLICY]

export const PARTIAL_POLICY_LABEL: Record<PartialPolicy, string> = {
  [PARTIAL_POLICY.ALLOWED]: '허용',
  [PARTIAL_POLICY.NOT_ALLOWED]: '불가',
  [PARTIAL_POLICY.UNDECIDED]: '미정',
}

/** 서버 값(`true`·`false`·`null`)을 화면의 부분 출고 선택으로 바꾼다 */
export const toPartialPolicy = (allowed: boolean | null): PartialPolicy => {
  if (allowed === null) {
    return PARTIAL_POLICY.UNDECIDED
  }
  return allowed ? PARTIAL_POLICY.ALLOWED : PARTIAL_POLICY.NOT_ALLOWED
}

export const fromPartialPolicy = (policy: PartialPolicy): boolean | null => {
  if (policy === PARTIAL_POLICY.UNDECIDED) {
    return null
  }
  return policy === PARTIAL_POLICY.ALLOWED
}

/** 분석 계산이 지원하는 판매 기준 일수. 다른 값을 저장하면 분석이 보류(`ON_HOLD`)되어 고정한다(명세 4.2) */
export const SUPPORTED_SALES_BASIS_DAYS = 28

/** 리드타임에 해상 운송이 없는 이유. 해상 기간은 고객사가 정하는 값이 아니다(ERD v6.2 `operating_lead_times`) */
export const SEA_TRANSIT_NOTE =
  '해상 운송 기간은 선적 일정과 공용 기준으로 정해져 운영 기준에서 관리하지 않습니다.'

export const OPERATING_RULE_ERROR = {
  EFFECTIVE_DATE_REQUIRED: '적용 시작일을 입력해주세요.',
  SAFETY_STOCK_DAYS_INVALID: '안전재고 일수는 1 이상의 정수로 입력해주세요.',
  LEAD_TIME_DAYS_INVALID: '일수는 0 이상의 정수로 입력해주세요.',
} as const
