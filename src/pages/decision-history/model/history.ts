import { formatYYYYMMDD, formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

export type HistoryStatus = 'final' | 'draft' | 'reanalysis'

export interface HistoryComment {
  author: string
  time: string
  text: string
}

export interface HistoryRecord {
  id: string
  /** ISO 8601 UTC. 예: '2026-10-21T00:24:00Z' */
  selectedAt: string
  shipmentCode: string
  productName: string
  option: string
  selector: string
  /** 분석 실행의 표시용 ID. 초안·최종 선택 모두 있다. 예: 'AN-261021-042' */
  runCode: string
  status: HistoryStatus
  reason: string
  comment: HistoryComment | null
  /** ISO 8601 UTC. 예: '2026-10-21T00:00:00Z' */
  baseDataAt: string
  analysis: {
    shortage: number
    riskOrders: number
    note: string
  }
}

export interface HistoryFilter {
  /** 'YYYY-MM-DD'. 화면(KST) 기준 날짜 */
  startDate: string
  /** 'YYYY-MM-DD'. 화면(KST) 기준 날짜 */
  endDate: string
  keyword: string
  status: HistoryStatus | ''
  selector: string
}

export const HISTORY_STATUS_LABEL: Record<HistoryStatus, string> = {
  final: '최종 선택',
  draft: '초안',
  reanalysis: '재분석 필요',
}

export const HISTORY_STATUS_OPTIONS = Object.keys(HISTORY_STATUS_LABEL) as HistoryStatus[]

export const HISTORY_PAGE_SIZE = 10

export const HISTORY_DISCLAIMER = '최종 선택은 판단의 기록이며 실제 출고 변경을 의미하지 않습니다.'

export const DEFAULT_HISTORY_FILTER: HistoryFilter = {
  startDate: '2026-10-01',
  endDate: '2026-10-21',
  keyword: '',
  status: '',
  selector: '',
}

/** UTC 시각을 한국 시간으로. '2026-10-21T00:24:00Z' -> '2026.10.21 09:24' */
export const formatSelectedAt = formatYYYYMMDDHHmm

/** UTC 시각을 한국 시간으로. '2026-10-21T00:00:00Z' -> '2026.10.21 09:00 KST' */
export const formatBaseDataAt = (baseDataAt: string) => `${formatYYYYMMDDHHmm(baseDataAt)} KST`

export const filterHistory = (records: HistoryRecord[], filter: HistoryFilter) => {
  const keyword = filter.keyword.trim().toLowerCase()

  return records.filter((record) => {
    // 조회 기간은 한국 날짜이므로, UTC 시각을 한국 날짜로 바꿔 비교한다.
    const date = formatYYYYMMDD(record.selectedAt)
    if (filter.startDate && date < filter.startDate) {
      return false
    }
    if (filter.endDate && date > filter.endDate) {
      return false
    }
    if (filter.status && record.status !== filter.status) {
      return false
    }
    if (filter.selector && record.selector !== filter.selector) {
      return false
    }
    return (
      !keyword ||
      record.shipmentCode.toLowerCase().includes(keyword) ||
      record.productName.toLowerCase().includes(keyword)
    )
  })
}
