import {
  type AnalysisRunDetail,
  DECISION_STATUS,
  DECISION_TYPE,
  type Decision,
  type DecisionStatus,
  type GetDecisionsParams,
  SKU_SCOPE,
} from '@/shared/api'
import { SEARCH_MAX_LENGTH } from '@/shared/config'
import { toUtcDayStart, toUtcNextDayStart } from '@/shared/lib/kst-date'

export interface HistoryFilter {
  /** 'YYYY-MM-DD'. 화면(KST) 기준 날짜. 고르지 않았으면 '' */
  startDate: string
  /** 'YYYY-MM-DD'. 화면(KST) 기준 날짜. 고르지 않았으면 '' */
  endDate: string
  keyword: string
  status: DecisionStatus | ''
}

export const HISTORY_STATUS_LABEL: Record<DecisionStatus, string> = {
  [DECISION_STATUS.FINAL]: '최종 선택',
  [DECISION_STATUS.DRAFT]: '초안',
  [DECISION_STATUS.NEEDS_REANALYSIS]: '재분석 필요',
}

export const HISTORY_STATUS_BADGE_VARIANT = {
  [DECISION_STATUS.FINAL]: 'success',
  [DECISION_STATUS.DRAFT]: 'neutral',
  [DECISION_STATUS.NEEDS_REANALYSIS]: 'warning',
} as const satisfies Record<DecisionStatus, 'success' | 'neutral' | 'warning'>

export const HISTORY_STATUS_OPTIONS = Object.keys(HISTORY_STATUS_LABEL) as DecisionStatus[]

/** 이력 목록의 조회 조건을 담는 주소 파라미터 이름. 새로고침·뒤로 가기에서도 조건이 유지되도록 주소에 담는다. */
export const HISTORY_PARAM = {
  START_DATE: 'start',
  END_DATE: 'end',
  KEYWORD: 'q',
  STATUS: 'status',
  PAGE: 'page',
} as const

const isDecisionStatus = (value: string | null): value is DecisionStatus =>
  value !== null && (HISTORY_STATUS_OPTIONS as string[]).includes(value)

/** 주소의 날짜 값. 실제로 있는 'YYYY-MM-DD'가 아니면 쓰지 않는다(`toUtcDayStart`가 잘못된 날짜에 빈 문자열을 준다). */
const parseDateParam = (value: string | null) => (value && toUtcDayStart(value) ? value : '')

/** 주소에서 조회 조건을 읽는다. 알 수 없는 상태나 잘못된 날짜는 비운 것으로 본다. */
export const parseHistoryFilter = (params: URLSearchParams): HistoryFilter => {
  const status = params.get(HISTORY_PARAM.STATUS)

  return {
    startDate: parseDateParam(params.get(HISTORY_PARAM.START_DATE)),
    endDate: parseDateParam(params.get(HISTORY_PARAM.END_DATE)),
    keyword: (params.get(HISTORY_PARAM.KEYWORD) ?? '').slice(0, SEARCH_MAX_LENGTH),
    status: isDecisionStatus(status) ? status : '',
  }
}

/** 두 조회 조건이 같은지. 같은 조건으로 "조회"를 다시 눌렀는지, 주소가 바뀌어 입력 칸을 맞춰야 하는지 가릴 때 쓴다. */
export const isSameHistoryFilter = (a: HistoryFilter, b: HistoryFilter) =>
  a.startDate === b.startDate &&
  a.endDate === b.endDate &&
  a.keyword === b.keyword &&
  a.status === b.status

/** 조회 조건을 주소 파라미터로 바꾼다. 비어 있거나 기본값인 조건은 싣지 않는다. */
export const toHistoryParams = (filter: HistoryFilter, page = 1) => {
  const params = new URLSearchParams()
  const entries: [string, string][] = [
    [HISTORY_PARAM.START_DATE, filter.startDate],
    [HISTORY_PARAM.END_DATE, filter.endDate],
    [HISTORY_PARAM.KEYWORD, filter.keyword.trim()],
    [HISTORY_PARAM.STATUS, filter.status],
    [HISTORY_PARAM.PAGE, page > 1 ? String(page) : ''],
  ]
  for (const [key, value] of entries) {
    if (value) {
      params.set(key, value)
    }
  }
  return params
}

/** 서버 `size`는 1~100. 화면은 10행씩 보여 준다 */
export const HISTORY_PAGE_SIZE = 10

export const HISTORY_DISCLAIMER = '최종 선택은 판단의 기록이며 실제 출고 변경을 의미하지 않습니다.'

/**
 * 화면 필터를 `GET /decisions` 요청으로 바꾼다. 서버의 기간은 `[from, to)`(UTC)라서,
 * 한국 날짜 시작일은 그날 00:00 KST로, 종료일은 **다음 날** 00:00 KST로 보내 종료일 하루를 포함한다.
 * 값이 없는 필터는 `undefined`로 두어 요청에 싣지 않는다.
 */
export const toDecisionParams = (filter: HistoryFilter, page: number): GetDecisionsParams => ({
  from: toUtcDayStart(filter.startDate) || undefined,
  to: toUtcNextDayStart(filter.endDate) || undefined,
  q: filter.keyword.trim() || undefined,
  status: filter.status || undefined,
  page,
  size: HISTORY_PAGE_SIZE,
})

/** AI 설명 문장 속 근거 표지(`[E1]`)를 숨긴다. 화면에는 표지 대신 문장만 보여 준다(명세 U10) */
export const stripEvidenceMarks = (text: string) => text.replace(/\s*\[E\d+\]/g, '').trim()

/** 앱 다른 곳과 날짜 모양을 맞춘다. '2026-01-27' -> '2026.01.27' */
const formatIsoDates = (text: string) => text.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$1.$2.$3')

/** AI 설명 문장을 화면에 보여 줄 모양으로: 근거 표지를 지우고 날짜 모양을 맞춘다 */
export const formatExplanationText = (text: string) => formatIsoDates(stripEvidenceMarks(text))

/** 선택 이유. 최종 선택은 선택 이유, 초안은 작성한 의견이다. 없으면 null */
export const getDecisionReason = (decision: Decision, run: AnalysisRunDetail) =>
  decision.decisionType === DECISION_TYPE.FINAL
    ? (run.finalDecision?.reasonText ?? null)
    : (run.drafts.find((draft) => draft.memberDraftId === decision.decisionId)?.opinionText ?? null)

/** 최종 선택 이력에 함께 보여 주는 팀원 의견. 의견 본문이 있는 초안만 오래된 순으로 */
export const getMemberOpinions = (decision: Decision, run: AnalysisRunDetail) =>
  decision.decisionType === DECISION_TYPE.FINAL
    ? run.drafts
        .filter((draft) => draft.opinionText)
        .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt))
    : []

/**
 * 당시 분석 요약의 부족 수량. 지연으로 늘어난 부족이다(명세 4.5 D21).
 * `IMPACTED` 행의 `shortageQuantity − baselineShortageQuantity`를 더한다. 계획대로 입고해도 생기는 기준선 부족과
 * 지연과 무관한 `WATCH`·`SHIPMENT_ONLY` 행이 섞이지 않게 하려는 것이다. 계산하지 않은 값(null)은 0으로 본다.
 */
export const getShortageTotal = (run: AnalysisRunDetail) =>
  run.inventoryImpacts
    .filter((impact) => impact.skuScope === SKU_SCOPE.IMPACTED)
    .reduce(
      (sum, impact) =>
        sum + Math.max((impact.shortageQuantity ?? 0) - (impact.baselineShortageQuantity ?? 0), 0),
      0,
    )
