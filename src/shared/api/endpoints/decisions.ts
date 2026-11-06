import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import type {
  ResponseOptionSummary,
  RunSummary,
  ShipmentSummary,
  SkuSummary,
  UserSummary,
} from '../summary'

export const DECISION_TYPE = {
  DRAFT: 'DRAFT',
  FINAL: 'FINAL',
} as const

export type DecisionType = (typeof DECISION_TYPE)[keyof typeof DECISION_TYPE]

/** 초안인데 실행이 `STALE`이면 `NEEDS_REANALYSIS` */
export const DECISION_STATUS = {
  DRAFT: 'DRAFT',
  FINAL: 'FINAL',
  NEEDS_REANALYSIS: 'NEEDS_REANALYSIS',
} as const

export type DecisionStatus = (typeof DECISION_STATUS)[keyof typeof DECISION_STATUS]

/** 판단 이력 한 건. 팀원 초안과 팀장 최종 선택이 한 목록에 섞여 온다. */
export interface Decision {
  decisionType: DecisionType
  decisionId: string
  /** 초안은 작성 시각, 최종 선택은 선택 시각. ISO 8601 UTC */
  decidedAt: string
  shipment: ShipmentSummary
  /** 선적 상세가 없으면 null */
  representativeSku: SkuSummary | null
  /** 의견만 쓴 초안이면 null */
  responseOption: ResponseOptionSummary | null
  decidedBy: UserSummary
  status: DecisionStatus
  run: RunSummary
  delayEventId: string
}

export interface GetDecisionsParams extends PageParams {
  /** 판단 시각 기준 `[from, to)`. ISO 8601 UTC 시각이고 `to`는 포함하지 않는다 */
  from?: string
  to?: string
  /** 선적 코드, 또는 그 선적에 실린 상품 코드·상품명 부분 일치. 최대 100자 */
  q?: string
  status?: DecisionStatus
}

export const getDecisions = (params?: GetDecisionsParams, config?: AxiosRequestConfig) =>
  API.get<Page<Decision>>(ENDPOINT.DECISIONS, { ...config, params })
