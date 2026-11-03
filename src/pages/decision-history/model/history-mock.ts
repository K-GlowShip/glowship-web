import { formatYYYYMMDD, kstToUtc } from '@/shared/lib/kst-date'

import type { HistoryRecord, HistoryStatus } from './history'

// TODO: 승인 및 실행 이력 API 명세 확정 후 서버 응답으로 교체

const MOCK_RECORD_COUNT = 128
const SELECTORS = ['김민지', '박지훈', '이서연']
const STATUS_CYCLE: HistoryStatus[] = ['NEEDS_REANALYSIS', 'FINAL', 'DRAFT']

const TEMPLATES = [
  {
    shipmentCode: 'GS-1021',
    productName: '클렌징',
    option: '기존 일정 유지',
    reason: '지연 영향이 제한적이라 추가 비용 없이 기존 일정을 유지합니다.',
    shortage: 320,
    riskOrders: 8,
    runSummary: '선적이 계획보다 2일 늦은 입고 예정입니다. 결과 분류: 지연 유발 위험 주문 있음.',
    riskSummary:
      '영향 SKU 1개에서 위험 주문 8건이 예상됩니다(지연 유발 8건). 예측 기준: 최근 28일 일 평균 판매량.',
    warnings: [],
  },
  {
    shipmentCode: 'GS-1022',
    productName: '토너',
    option: '일부 물량 분할 운송',
    reason: '긴급 주문 물량만 먼저 보내 위험 주문을 줄입니다.',
    shortage: 580,
    riskOrders: 15,
    runSummary: '선적이 계획보다 3일 늦은 입고 예정입니다. 결과 분류: 지연 유발 위험 주문 있음.',
    riskSummary:
      '영향 SKU 2개에서 위험 주문 15건이 예상됩니다(지연 유발 12건, 기존 위험 3건). 예측 기준: 최근 28일 일 평균 판매량.',
    warnings: [],
  },
  {
    shipmentCode: 'GS-1023',
    productName: '선크림',
    option: '항공 긴급 운송',
    reason: '성수기 판매 손실을 막기 위해 항공으로 우선 확보합니다.',
    shortage: 940,
    riskOrders: 27,
    runSummary: '선적이 계획보다 5일 늦은 입고 예정입니다. 결과 분류: 지연 유발 위험 주문 있음.',
    riskSummary:
      '영향 SKU 1개에서 재고 소진이 3일 앞당겨지고 위험 주문 27건이 예상됩니다(지연 유발 27건). 예측 기준: 최근 28일 일 평균 판매량.',
    warnings: [
      {
        code: 'FORECAST_EVENT_OVERLAP',
        text: '판매 기준 기간이 행사 기간과 겹쳐 예측이 실제와 다를 수 있습니다.',
      },
    ],
  },
]

// 서버 응답과 같은 형식(ISO 8601 UTC, 'Z')으로 만든다.
const toUtcIso = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z')

// 기준 데이터는 그 날(한국 날짜) 09:00에 수집한 것으로 둔다.
const toBaseDataAt = (date: Date) => kstToUtc(`${formatYYYYMMDD(toUtcIso(date))}T09:00`)

const toRunCode = (date: Date, index: number) =>
  `AN-${formatYYYYMMDD(toUtcIso(date)).replaceAll('-', '').slice(2)}-${String(index % 1000).padStart(3, '0')}`

const GENERATED_START = new Date(kstToUtc('2026-10-20T17:30'))
const GENERATED_STEP_MS = 3 * 60 * 60 * 1000

const createGeneratedRecord = (index: number): HistoryRecord => {
  const template = TEMPLATES[index % TEMPLATES.length]
  const status = STATUS_CYCLE[index % STATUS_CYCLE.length]
  const date = new Date(GENERATED_START.getTime() - (index - 2) * GENERATED_STEP_MS)

  return {
    id: `history-${index + 1}`,
    selectedAt: toUtcIso(date),
    shipmentCode: template.shipmentCode,
    productName: template.productName,
    option: template.option,
    selector: SELECTORS[index % SELECTORS.length],
    runCode: toRunCode(date, index),
    status,
    reason: template.reason,
    comment: null,
    baseDataAt: toBaseDataAt(date),
    analysis: {
      shortage: template.shortage,
      riskOrders: template.riskOrders,
      runSummary: template.runSummary,
      riskSummary: template.riskSummary,
      warnings: template.warnings,
    },
  }
}

const FEATURED_RECORDS: HistoryRecord[] = [
  {
    id: 'history-1',
    selectedAt: '2026-10-21T00:24:00Z',
    shipmentCode: 'GS-1024',
    productName: '크림',
    option: 'NJ 재고 전환',
    selector: '김민지',
    runCode: 'AN-261021-042',
    status: 'FINAL',
    reason:
      '추가 운송비 없이 위험 주문 42건을 우선 보호합니다. LA 입고 전까지 NJ의 여유 재고 800개를 활용합니다.',
    comment: { author: '박지훈', time: '09:12', text: 'NJ 창고 전환 가능 수량 확인했습니다.' },
    baseDataAt: '2026-10-21T00:00:00Z',
    analysis: {
      shortage: 1240,
      riskOrders: 42,
      runSummary: '선적이 계획보다 4일 늦은 입고 예정입니다. 결과 분류: 지연 유발 위험 주문 있음.',
      riskSummary:
        '영향 SKU 1개에서 위험 주문 42건이 예상됩니다(지연 유발 42건). 예측 기준: 최근 28일 일 평균 판매량.',
      warnings: [],
    },
  },
  {
    id: 'history-2',
    selectedAt: '2026-10-20T23:51:00Z',
    shipmentCode: 'GS-1023',
    productName: '선크림',
    option: '항공 긴급 운송',
    selector: '박지훈',
    runCode: 'AN-261020-038',
    status: 'DRAFT',
    reason: '성수기 판매 손실을 막기 위해 항공으로 우선 확보합니다.',
    comment: null,
    baseDataAt: '2026-10-20T23:30:00Z',
    analysis: {
      shortage: 940,
      riskOrders: 27,
      runSummary: '선적이 계획보다 5일 늦은 입고 예정입니다. 결과 분류: 지연 유발 위험 주문 있음.',
      riskSummary:
        '영향 SKU 1개에서 재고 소진이 3일 앞당겨지고 위험 주문 27건이 예상됩니다(지연 유발 27건). 예측 기준: 최근 28일 일 평균 판매량.',
      warnings: [
        {
          code: 'FORECAST_EVENT_OVERLAP',
          text: '판매 기준 기간이 행사 기간과 겹쳐 예측이 실제와 다를 수 있습니다.',
        },
      ],
    },
  },
  {
    id: 'history-3',
    selectedAt: '2026-10-20T08:30:00Z',
    shipmentCode: 'GS-1025',
    productName:
      '글로우쉽 시카 판테놀 수분 장벽 리페어 크림 기획세트 (본품 50ml + 미니 15ml x 2 + 쿠션 퍼프 증정) 대용량 리필 한정 에디션',
    option: 'NJ 재고 전환',
    selector: '이서연',
    runCode: 'AN-261020-021',
    status: 'FINAL',
    reason: '기획세트 한정 물량이라 NJ 여유 재고를 먼저 전환해 위험 주문을 보호합니다.',
    comment: null,
    baseDataAt: '2026-10-20T00:00:00Z',
    analysis: {
      shortage: 460,
      riskOrders: 12,
      runSummary: '선적이 계획보다 2일 늦은 입고 예정입니다. 결과 분류: 지연 유발 위험 주문 있음.',
      riskSummary:
        '영향 SKU 1개에서 위험 주문 12건이 예상됩니다(지연 유발 12건). 예측 기준: 최근 28일 일 평균 판매량.',
      warnings: [],
    },
  },
]

export const HISTORY_RECORDS: HistoryRecord[] = Array.from(
  { length: MOCK_RECORD_COUNT },
  (_, index) => FEATURED_RECORDS[index] ?? createGeneratedRecord(index),
)
