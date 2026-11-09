import {
  EXTERNAL_CODE_SOURCE,
  type ExternalCode,
  type ExternalCodeSource,
  POPULARITY_TIER,
  type Sku,
  type SkuDetail,
  VALIDATION_STATUS,
  type ValidationStatus,
} from '@/shared/api'

export const VALIDATION_STATUS_LABEL: Record<ValidationStatus, string> = {
  [VALIDATION_STATUS.OK]: '정상',
  [VALIDATION_STATUS.CODE_MISSING]: '코드 누락',
  [VALIDATION_STATUS.ISSUE_OPEN]: '검증 오류',
}

export const EXTERNAL_CODE_SOURCE_LABEL: Record<ExternalCodeSource, string> = {
  [EXTERNAL_CODE_SOURCE.INVENTORY]: '재고(WMS)',
  [EXTERNAL_CODE_SOURCE.SHIPMENT]: '선적(TMS)',
}

export const isCodeMissing = ({ externalCode }: ExternalCode) => externalCode === null

export const isProductError = ({ validationStatus }: Sku) =>
  validationStatus !== VALIDATION_STATUS.OK

export const isHitProduct = ({ popularityTier }: Sku) => popularityTier === POPULARITY_TIER.HIT

export const getProductErrorTitle = (sku: Sku) => {
  const sources = sku.externalCodes
    .filter(isCodeMissing)
    .map(({ sourceDomain }) => EXTERNAL_CODE_SOURCE_LABEL[sourceDomain])

  return sources.length === 0
    ? '검증 오류가 있습니다'
    : `검증 오류: ${sources.join(', ')} 외부 코드가 매핑되지 않았습니다`
}

/**
 * 이 상품이 포함되고 분석이 보류된 지연의 선적 코드. 이 상품 때문에 보류됐다는 뜻은 아니다(서버 `affectedDelayEvents`).
 * 없으면 null.
 */
export const getProductErrorImpact = ({ affectedDelayEvents }: SkuDetail) =>
  affectedDelayEvents.length === 0
    ? null
    : `이 상품이 포함된 분석 보류 지연: ${affectedDelayEvents.map(({ shipment }) => shipment.shipmentCode).join(', ')}. 상품 정보를 보완해 다시 수집한 뒤, 지연 대응 센터에서 "재분석 요청"을 해 주세요.`
