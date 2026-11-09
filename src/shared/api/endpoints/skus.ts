import type { AxiosRequestConfig } from 'axios'

import { API } from '../fetcher'
import type { Page, PageParams } from '../page'
import { ENDPOINT } from '../paths'
import type { ShipmentSummary, RunSummary } from '../summary'

export const VALIDATION_STATUS = {
  OK: 'OK',
  CODE_MISSING: 'CODE_MISSING',
  ISSUE_OPEN: 'ISSUE_OPEN',
} as const

export type ValidationStatus = (typeof VALIDATION_STATUS)[keyof typeof VALIDATION_STATUS]

/** 상품 코드를 따로 쓰는 원천. 서버가 항목을 항상 하나씩 내려준다. */
export const EXTERNAL_CODE_SOURCE = {
  INVENTORY: 'INVENTORY',
  SHIPMENT: 'SHIPMENT',
} as const

export type ExternalCodeSource = (typeof EXTERNAL_CODE_SOURCE)[keyof typeof EXTERNAL_CODE_SOURCE]

export const MAPPING_STATUS = {
  MAPPED: 'MAPPED',
  UNMAPPED: 'UNMAPPED',
} as const

export type MappingStatus = (typeof MAPPING_STATUS)[keyof typeof MAPPING_STATUS]

export interface ExternalCode {
  sourceDomain: ExternalCodeSource
  /** 매핑이 없으면 null */
  externalCode: string | null
  mappingStatus: MappingStatus
}

export const POPULARITY_TIER = {
  HIT: 'HIT',
  REGULAR: 'REGULAR',
  LONG_TAIL: 'LONG_TAIL',
} as const

export type PopularityTier = (typeof POPULARITY_TIER)[keyof typeof POPULARITY_TIER]

export interface Sku {
  skuId: string
  /** 화면의 "ERP 코드" */
  skuCode: string
  productName: string
  brandName: string
  hs10: string
  category: string
  subcategory: string
  popularityTier: PopularityTier
  isEmergencyAirEligible: boolean
  unitCode: string
  unitsPerCase: number
  status: 'ACTIVE' | 'INACTIVE'
  externalCodes: ExternalCode[]
  validationStatus: ValidationStatus
}

export interface SkuValidationIssue {
  dataValidationIssueId: string
  sourceRecordKey: string
  fieldName: string | null
  errorCode: string
  errorMessage: string
  severity: string
  /** ISO 8601 UTC */
  detectedAt: string
}

/** 이 상품이 포함되고 최신 분석이 보류(`ON_HOLD`)인 열린 지연. 이 상품 때문에 보류됐다는 뜻은 아니다. */
export interface AffectedDelayEvent {
  delayEventId: string
  shipment: ShipmentSummary
  currentRun: RunSummary | null
}

export interface SkuDetail extends Sku {
  issues: SkuValidationIssue[]
  affectedDelayEvents: AffectedDelayEvent[]
}

export interface GetSkusParams extends PageParams {
  /** 상품명·ERP 코드 부분 일치. 최대 100자 */
  q?: string
  onlyErrors?: boolean
}

export const getSkus = (params?: GetSkusParams, config?: AxiosRequestConfig) =>
  API.get<Page<Sku>>(ENDPOINT.SKUS, { ...config, params })

/** 상품 상세. 없는 상품·다른 고객사 상품은 404 `SKU_NOT_FOUND` */
export const getSku = (skuId: string, config?: AxiosRequestConfig) =>
  API.get<SkuDetail>(`${ENDPOINT.SKUS}/${encodeURIComponent(skuId)}`, config)
