export type HistoryStatus = 'final' | 'draft' | 'reanalysis'

export interface HistoryComment {
  author: string
  time: string
  text: string
}

export interface HistoryRecord {
  id: string
  /** 'YYYY-MM-DDTHH:mm' 형식 */
  selectedAt: string
  shipmentCode: string
  productName: string
  option: string
  selector: string
  executionId: string | null
  status: HistoryStatus
  approval: string | null
  reason: string
  comment: HistoryComment | null
  baseDataAt: string
  analysis: {
    shortage: number
    riskOrders: number
    note: string
  }
}

export interface HistoryFilter {
  startDate: string
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

export const HISTORY_DISCLAIMER =
  '최종 선택은 판단의 기록이며 실제 출고 변경을 의미하지 않습니다. 실행 연동 여부와 실행 결과는 별도 상태로 표시합니다.'

export const DEFAULT_HISTORY_FILTER: HistoryFilter = {
  startDate: '2026-10-01',
  endDate: '2026-10-21',
  keyword: '',
  status: '',
  selector: '',
}

/** '2026-10-21T09:24' -> '10.21 09:24' */
export const formatSelectedAt = (selectedAt: string) =>
  `${selectedAt.slice(5, 10).replace('-', '.')} ${selectedAt.slice(11, 16)}`

export const filterHistory = (records: HistoryRecord[], filter: HistoryFilter) => {
  const keyword = filter.keyword.trim().toLowerCase()

  return records.filter((record) => {
    const date = record.selectedAt.slice(0, 10)
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
