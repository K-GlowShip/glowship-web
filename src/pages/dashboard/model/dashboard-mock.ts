import { DELAY_STATUS, REGION_CODE, STAGE_CODE, TRANSPORT_MODE } from '@/entities/delay-event'

import {
  addDays,
  INVENTORY_STATUS,
  SYNC_STATUS,
  type DashboardSummary,
  type DelayListResult,
  type InboundTrendPoint,
  type InventoryItem,
  type InventoryStatus,
  type InventoryStatusResult,
  type SyncStatusResult,
  type TrendDays,
} from './dashboard'

// ───────── 목업: 대시보드 API 연동 시 서버 응답으로 교체 ─────────

export const MOCK_SUMMARY: DashboardSummary = {
  inTransitShipmentCount: 248,
  weekOverWeek: 12,
  delayedShipmentCount: 20,
  dayOverDay: 3,
  onTimeInboundRate: 0.964,
  monthOverMonth: 0.021,
  atRiskOrderCount: 186,
  atRiskOrderRate: 0.038,
  lastSyncedAt: '2026-10-21T00:30:00Z',
}

export const MOCK_SYNC_STATUS: SyncStatusResult = {
  syncIntervalMinutes: 10,
  sources: [
    {
      sourceDomain: 'ORDER',
      name: '주문',
      sourceSystemName: 'ERP',
      status: SYNC_STATUS.SUCCEEDED,
      finishedAt: '2026-10-21T00:30:00Z',
      openIssueCount: 0,
    },
    {
      sourceDomain: 'INVENTORY',
      name: '재고',
      sourceSystemName: 'WMS',
      status: SYNC_STATUS.SUCCEEDED,
      finishedAt: '2026-10-21T00:30:00Z',
      openIssueCount: 0,
    },
    {
      sourceDomain: 'SHIPMENT',
      name: '선적',
      sourceSystemName: 'TMS',
      status: SYNC_STATUS.FAILED,
      finishedAt: '2026-10-21T00:10:00Z',
      openIssueCount: 3,
    },
  ],
}

// 지연 대응 센터 목업(pages/delay-center)의 앞쪽 5건과 같은 값이다. 서로 import할 수 없어(같은 layer) 값을 맞춰 뒀다
/** 새 지연 알림 건수(최근 감지·최종 선택 전). 1건이면 상세로, 여러 건이면 목록으로 보낸다 */
export const MOCK_NEW_DELAY_ALERT_COUNT = 3

export const MOCK_DELAYS: DelayListResult = {
  totalCount: 18,
  counts: {
    READY_FOR_REVIEW: 10,
    NEEDS_REANALYSIS: 3,
    ON_HOLD: 2,
    ANALYZING: 3,
  },
  items: [
    {
      delayEventId: 'de-1024',
      shipmentCode: 'OCN-20260910',
      warehouseRegion: REGION_CODE.WEST,
      productName: 'A Glow Hydra Cream 50ml',
      skuCount: 3,
      route: 'KR → LOS ANGELES',
      transportMode: TRANSPORT_MODE.OCEAN,
      stage: STAGE_CODE.AT_SEA,
      planned3plInboundDate: '2026-10-24',
      expected3plInboundDate: '2026-10-28',
      delayDays: 4,
      atRiskOrderCount: 42,
      status: DELAY_STATUS.READY,
    },
    {
      delayEventId: 'de-1023',
      shipmentCode: 'OCN-20260911',
      warehouseRegion: REGION_CODE.WEST,
      productName: 'A Glow Calming Serum 30ml',
      skuCount: 1,
      route: 'KR → LOS ANGELES',
      transportMode: TRANSPORT_MODE.OCEAN,
      stage: STAGE_CODE.AT_PORT,
      planned3plInboundDate: '2026-10-25',
      expected3plInboundDate: '2026-10-28',
      delayDays: 3,
      atRiskOrderCount: null,
      status: DELAY_STATUS.ANALYZING,
    },
    {
      delayEventId: 'de-1021',
      shipmentCode: 'AIR-REG-20261005',
      warehouseRegion: REGION_CODE.WEST,
      productName: 'A Glow Hydra Mask Pack 5ea',
      skuCount: 1,
      route: 'KR → LOS ANGELES',
      transportMode: TRANSPORT_MODE.AIR,
      stage: STAGE_CODE.IN_AIR,
      planned3plInboundDate: '2026-10-25',
      expected3plInboundDate: '2026-10-28',
      delayDays: 3,
      atRiskOrderCount: null,
      status: DELAY_STATUS.ON_HOLD,
    },
    {
      delayEventId: 'de-1020',
      shipmentCode: 'OCN-20260913',
      warehouseRegion: REGION_CODE.WEST,
      productName: 'A Glow Hydra Toner Pad 60ea',
      skuCount: 2,
      route: 'KR → LOS ANGELES',
      transportMode: TRANSPORT_MODE.OCEAN,
      stage: STAGE_CODE.PRE_DEPARTURE,
      planned3plInboundDate: '2026-10-26',
      expected3plInboundDate: '2026-10-28',
      delayDays: 2,
      atRiskOrderCount: 2,
      status: DELAY_STATUS.READY,
    },
    {
      delayEventId: 'de-1019',
      shipmentCode: 'AIR-REG-20261006',
      warehouseRegion: REGION_CODE.WEST,
      productName: 'A Glow Hydra Serum 30ml',
      skuCount: 1,
      route: 'KR → LOS ANGELES',
      transportMode: TRANSPORT_MODE.AIR,
      stage: STAGE_CODE.IN_AIR,
      planned3plInboundDate: '2026-10-26',
      expected3plInboundDate: '2026-10-28',
      delayDays: 2,
      atRiskOrderCount: 0,
      status: DELAY_STATUS.READY,
    },
  ],
}

const MOCK_INVENTORY_DATE = '2026-10-20'
const MOCK_SAFETY_STOCK_DAYS = 7
// 지연 대응 센터 목업의 상품명과 같다
const MOCK_PRODUCTS = [
  'A Glow Hydra Cream 50ml',
  'A Glow Calming Serum 30ml',
  'A Glow Hydra Mask Pack 5ea',
  'A Glow Hydra Toner Pad 60ea',
  'A Glow Hydra Serum 30ml',
  'A Glow Calming Toner 150ml',
  'A Glow Hydra Mist 100ml',
  'A Glow Cleansing Oil 200ml',
]
const MOCK_INVENTORY_REGIONS = [
  { warehouseId: 'wh-la', regionCode: REGION_CODE.WEST },
  { warehouseId: 'wh-nj', regionCode: REGION_CODE.EAST },
] as const
const INVENTORY_STATUS_RANK: Record<InventoryStatus, number> = { RISK: 0, CAUTION: 1, OK: 2 }

/** 명세 4.4 계산 규칙(입고 예정 미반영)으로 만든 목업 행. 서버 정렬(위험 순 → 소진일 빠른 순)도 따른다 */
const buildMockInventoryItems = (): InventoryItem[] => {
  const baseDate = addDays(MOCK_INVENTORY_DATE, 1)
  const items = MOCK_PRODUCTS.flatMap((productName, productIndex) =>
    MOCK_INVENTORY_REGIONS.map(({ warehouseId, regionCode }, regionIndex): InventoryItem => {
      const averageDailySales = 120 + ((productIndex * 37 + regionIndex * 53) % 220)
      const availableQuantity = Math.round(
        averageDailySales * (3 + ((productIndex * 5 + regionIndex * 11) % 30)),
      )
      const safetyStock = Math.ceil(averageDailySales * MOCK_SAFETY_STOCK_DAYS)
      const breachOffset = Math.floor((availableQuantity - safetyStock) / averageDailySales) + 1
      const stockoutOffset = Math.floor(availableQuantity / averageDailySales) + 1
      const status: InventoryStatus =
        breachOffset <= 0
          ? INVENTORY_STATUS.RISK
          : breachOffset <= MOCK_SAFETY_STOCK_DAYS
            ? INVENTORY_STATUS.CAUTION
            : INVENTORY_STATUS.OK
      return {
        warehouseId,
        skuId: `sku-${productIndex}`,
        warehouseRegion: regionCode,
        productName,
        availableQuantity,
        averageDailySales,
        safetyStockBreachDate: addDays(baseDate, Math.max(breachOffset, 0)),
        stockoutDate: addDays(baseDate, stockoutOffset),
        status,
      }
    }),
  )
  return items.sort(
    (a, b) =>
      INVENTORY_STATUS_RANK[a.status] - INVENTORY_STATUS_RANK[b.status] ||
      (a.stockoutDate ?? '9999').localeCompare(b.stockoutDate ?? '9999'),
  )
}

export const MOCK_INVENTORY: InventoryStatusResult = {
  inventoryDate: MOCK_INVENTORY_DATE,
  salesBasisDays: 28,
  safetyStockDays: MOCK_SAFETY_STOCK_DAYS,
  items: buildMockInventoryItems(),
}

// 입고 추이는 선적 목록에서 명세 정의(4.4)대로 날짜별로 세어 만든다.
// plannedCount = 그날이 planned_3pl_inbound_date인 선적 수, actualCount = 그날이 actual_3pl_inbound_date인 선적 수
interface MockShipment {
  /** 계획 3PL 입고일(UTC 날짜). 지연을 반영하기 전의 값이다 */
  plannedInboundDate: string
  /** 실제 3PL 입고일. 아직 입고되지 않았으면 null */
  actualInboundDate: string | null
}

/** 기준일 = 마지막 수집 완료 시각의 UTC 날짜(명세 C22) */
const MOCK_TREND_BASE_DATE = (MOCK_SUMMARY.lastSyncedAt ?? '').slice(0, 10)
const MOCK_SHIPMENT_DAYS = 100
/** 입고가 계획보다 며칠 늦었는지. 대부분 제때 들어오고 일부만 늦는다 */
const MOCK_DELAY_PATTERN = [0, 0, 0, 0, 0, 1, 1, 2, 3, 4]

/** 같은 입력에는 항상 같은 0~999 값. 목업이 새로고침마다 바뀌지 않게 한다 */
const pseudoRandom = (seed: number) => ((seed * 2654435761) >>> 0) % 1000

const MOCK_SHIPMENTS: MockShipment[] = Array.from({ length: MOCK_SHIPMENT_DAYS }, (_, back) => {
  const plannedInboundDate = addDays(MOCK_TREND_BASE_DATE, -back)
  const shipmentCount = 3 + (pseudoRandom(back + 1) % 9)
  return Array.from({ length: shipmentCount }, (_, index): MockShipment => {
    const delayDays =
      MOCK_DELAY_PATTERN[pseudoRandom(back * 31 + index + 7) % MOCK_DELAY_PATTERN.length]
    const actualInboundDate = addDays(plannedInboundDate, delayDays)
    return {
      plannedInboundDate,
      // 기준일까지 들어온 선적만 실제 입고일이 있다
      actualInboundDate: actualInboundDate <= MOCK_TREND_BASE_DATE ? actualInboundDate : null,
    }
  })
}).flat()

/** days일치 입고 추이 목업. 날짜마다 점 하나(0건인 날도 0), 기준일이 마지막이다. */
export const buildMockTrend = (days: TrendDays): InboundTrendPoint[] =>
  Array.from({ length: days }, (_, index) => {
    const date = addDays(MOCK_TREND_BASE_DATE, index + 1 - days)
    return {
      date,
      plannedCount: MOCK_SHIPMENTS.filter((shipment) => shipment.plannedInboundDate === date)
        .length,
      actualCount: MOCK_SHIPMENTS.filter((shipment) => shipment.actualInboundDate === date).length,
    }
  })
