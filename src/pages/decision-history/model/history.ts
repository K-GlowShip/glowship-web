import {
  type AnalysisRunDetail,
  DECISION_STATUS,
  DECISION_TYPE,
  type Decision,
  type DecisionStatus,
  type GetDecisionsParams,
} from '@/shared/api'
import { formatYYYYMMDDHHmm, toUtcDayStart, toUtcNextDayStart } from '@/shared/lib/kst-date'

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

/** UTC 시각을 한국 시간으로. '2026-10-21T00:24:00Z' -> '2026.10.21 09:24' */
export const formatSelectedAt = formatYYYYMMDDHHmm

/** UTC 시각을 한국 시간으로. '2026-10-21T00:00:00Z' -> '2026.10.21 09:00 KST' */
export const formatBaseDataAt = (baseDataAt: string) => `${formatYYYYMMDDHHmm(baseDataAt)} KST`

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

/** 당시 분석 요약의 부족 수량. 상품·창고별 `shortageQuantity`의 합(계산하지 않은 값은 0) */
export const getShortageTotal = (run: AnalysisRunDetail) =>
  run.inventoryImpacts.reduce((sum, impact) => sum + (impact.shortageQuantity ?? 0), 0)
