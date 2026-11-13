import { describe, expect, it } from 'vitest'

import {
  ANALYSIS_RUN_STATUS,
  SHIPMENT_STAGE,
  TRANSPORT_MODE,
  type DelayEventListItem,
  type Shipment,
} from '@/shared/api'

import { isFullyFetched, toTransportSummaries } from './hero-route'

const shipment = (overrides: Partial<Shipment>): Shipment => ({
  shipmentId: 'id',
  shipmentCode: 'OCN-1',
  transportMode: TRANSPORT_MODE.OCEAN,
  route: 'KR → LOS ANGELES',
  warehouse: {} as Shipment['warehouse'],
  representativeSku: null,
  skuCount: 1,
  stage: SHIPMENT_STAGE.AT_SEA,
  plannedKrReleaseDate: '2026-07-01',
  planned3plInboundDate: '2026-07-20',
  expected3plInboundDate: '2026-07-20',
  actual3plInboundDate: null,
  isDelayed: false,
  delayDays: 0,
  ...overrides,
})

const delayEvent = (overrides: Partial<DelayEventListItem>): DelayEventListItem => ({
  delayEventId: 'event',
  episodeNo: 1,
  shipment: {} as DelayEventListItem['shipment'],
  warehouse: {} as DelayEventListItem['warehouse'],
  representativeSku: null,
  skuCount: 1,
  route: 'KR → LOS ANGELES',
  transportMode: TRANSPORT_MODE.OCEAN,
  stage: SHIPMENT_STAGE.AT_SEA,
  planned3plInboundDate: '2026-07-20',
  expected3plInboundDate: '2026-08-01',
  delayDays: 12,
  detectedAt: '2026-07-02T00:00:00Z',
  closedAt: null,
  closeReason: null,
  atRiskOrderCount: 0,
  currentRun: {
    runId: 'run',
    runCode: 'R-1',
    status: ANALYSIS_RUN_STATUS.READY_FOR_REVIEW,
    resultClass: null,
    failureCode: null,
  },
  hasFinalDecision: false,
  ...overrides,
})

describe('toTransportSummaries', () => {
  it('진행 중 선적은 운송 수단별로 세고, 확인 필요는 열려 있고 최종 선택 전인 지연 이벤트만 센다(해상이 먼저)', () => {
    const result = toTransportSummaries(
      [
        shipment({ shipmentCode: 'AIR-1', transportMode: TRANSPORT_MODE.AIR }),
        shipment({ shipmentCode: 'OCN-1' }),
        shipment({ shipmentCode: 'OCN-2', isDelayed: true, delayDays: 3 }),
        shipment({ shipmentCode: 'AIR-2', transportMode: TRANSPORT_MODE.AIR, isDelayed: true }),
      ],
      [
        delayEvent({ delayEventId: 'sea-open' }),
        delayEvent({ delayEventId: 'air-open', transportMode: TRANSPORT_MODE.AIR }),
        // 이미 최종 선택됨: 요약의 지연 선적 수에 들어가지 않으므로 범례에서도 뺀다
        delayEvent({
          delayEventId: 'air-finalized',
          transportMode: TRANSPORT_MODE.AIR,
          hasFinalDecision: true,
        }),
        // 종료된 과거 이벤트
        delayEvent({ delayEventId: 'sea-closed', closedAt: '2026-01-16T00:03:20Z' }),
        // 현재 실행이 '지연 아님'으로 끝난 이벤트
        delayEvent({
          delayEventId: 'sea-no-delay',
          currentRun: {
            runId: 'run-2',
            runCode: 'R-2',
            status: ANALYSIS_RUN_STATUS.NO_DELAY,
            resultClass: null,
            failureCode: null,
          },
        }),
      ],
    )

    expect(result).toEqual([
      {
        transportMode: TRANSPORT_MODE.OCEAN,
        label: '해상',
        count: 2,
        needsReviewCount: 1,
        route: 'PUS → LAX',
      },
      {
        transportMode: TRANSPORT_MODE.AIR,
        label: '항공',
        count: 2,
        needsReviewCount: 1,
        route: 'ICN → EWR',
      },
    ])
  })

  it('입고 완료(RECEIVED) 선적은 세지 않고, 지연 이벤트가 없는 수단은 확인 필요 0건이다', () => {
    const result = toTransportSummaries(
      [
        shipment({ shipmentCode: 'OCN-1' }),
        shipment({
          shipmentCode: 'OCN-2',
          stage: SHIPMENT_STAGE.RECEIVED,
          actual3plInboundDate: '2026-07-25',
          isDelayed: true,
        }),
        shipment({
          shipmentCode: 'AIR-1',
          transportMode: TRANSPORT_MODE.AIR,
          stage: SHIPMENT_STAGE.RECEIVED,
          actual3plInboundDate: '2026-07-10',
        }),
      ],
      [],
    )

    expect(result).toEqual([
      {
        transportMode: TRANSPORT_MODE.OCEAN,
        label: '해상',
        count: 1,
        needsReviewCount: 0,
        route: 'PUS → LAX',
      },
    ])
  })

  it('지연 이벤트 목록을 아직 못 받았으면 확인 필요 건수만 null이고, 선적이 없으면 빈 목록이다', () => {
    expect(toTransportSummaries([], null)).toEqual([])

    const [ocean] = toTransportSummaries([shipment({ shipmentCode: 'OCN-1' })], null)
    expect(ocean).toEqual({
      transportMode: TRANSPORT_MODE.OCEAN,
      label: '해상',
      count: 1,
      needsReviewCount: null,
      route: 'PUS → LAX',
    })
  })
})

describe('isFullyFetched', () => {
  it('받은 수가 전체 건수와 같거나 많으면 빠짐없이 받은 것이다', () => {
    expect(isFullyFetched({ items: [1, 2, 3], totalCount: 3 })).toBe(true)
    expect(isFullyFetched({ items: [], totalCount: 0 })).toBe(true)
  })

  it('전체 건수보다 적게 받았으면(서버 최대 수를 넘음) 빠짐없이 받은 것이 아니다', () => {
    expect(isFullyFetched({ items: [1, 2, 3], totalCount: 120 })).toBe(false)
  })
})
