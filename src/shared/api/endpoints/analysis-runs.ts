import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import { ENDPOINT } from '../paths'
import type { ResponseOptionSummary, UserSummary } from '../summary'

export interface MemberDraft {
  memberDraftId: string
  author: UserSummary
  /** 의견만 쓴 초안이면 null */
  responseOption: ResponseOptionSummary | null
  opinionText: string | null
  /** ISO 8601 UTC */
  createdAt: string
}

export interface FinalDecision {
  finalDecisionId: string
  decidedBy: UserSummary
  responseOption: ResponseOptionSummary
  reasonText: string
  /** ISO 8601 UTC */
  decidedAt: string
  checkedSeq: number
}

/** 저장된 `explanation.v1` JSON. 감싸는 필드만 camelCase이고 안쪽은 저장된 키(snake_case) 그대로다. */
export interface RunExplanation {
  run_summary: string
  risk_summary: string
  warnings: { code: string; text: string }[]
}

/**
 * 분석 실행 상세. 응답이 커서 화면이 쓰는 필드만 타입으로 적었다. 필요한 필드는 쓰는 화면에서 더한다.
 * 상태에 따라 결과가 없으면 목록은 `[]`, 객체는 `null`이다.
 */
export interface AnalysisRunDetail {
  runId: string
  runCode: string | null
  status: string
  inputBasis: {
    /** 분석이 쓴 데이터의 기준 시각. ISO 8601 UTC */
    dataBasisAt: string | null
  }
  inventoryImpacts: { shortageQuantity: number | null }[]
  /** 위험 주문. 주문 단위로 한 항목이다 */
  atRiskOrders: { orderId: string }[]
  explanation: RunExplanation | null
  drafts: MemberDraft[]
  finalDecision: FinalDecision | null
}

/** 없는 실행·다른 고객사 실행은 404 `ANALYSIS_RUN_NOT_FOUND` */
export const getAnalysisRun = (runId: string, config?: AxiosRequestConfig) =>
  API.get<AnalysisRunDetail>(`${ENDPOINT.ANALYSIS_RUNS}/${encodeURIComponent(runId)}`, config)
