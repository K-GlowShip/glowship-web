/** 명세 v6.2 `GET /skus`의 `validationStatus` */
export type ValidationStatus = 'OK' | 'CODE_MISSING' | 'ISSUE_OPEN'

/** 상품 외부 코드를 내려주는 원천. 명세 v6.2 `GET /skus`의 `externalCodes[].sourceDomain` */
export type ExternalCodeSource = 'INVENTORY' | 'SHIPMENT'

/** `GET /skus`의 `externalCodes[].mappingStatus`. 어느 SKU에도 붙지 않은 `PENDING`은 오지 않는다 */
export type MappingStatus = 'MAPPED' | 'UNMAPPED'

export interface ExternalCode {
  sourceDomain: ExternalCodeSource
  /** 서버가 SKU 코드를 쓰는 원천(INVENTORY, SHIPMENT)을 항상 내려주고, 매핑이 없으면 null */
  externalCode: string | null
  mappingStatus: MappingStatus
}

export interface Product {
  id: string
  name: string
  brandName: string
  category: string
  subcategory: string
  hs10: string
  unitsPerCase: number
  erpCode: string
  externalCodes: ExternalCode[]
  isHit: boolean
  isEmergencyAirEligible: boolean
  validationStatus: ValidationStatus
  /** 이 오류 때문에 분석이 보류된 지연의 선적 코드. 명세 `affectedDelayEvents[]` */
  affectedShipmentCodes: string[]
}

export interface ProductFilter {
  query: string
  onlyErrors: boolean
}

export const VALIDATION_STATUS_LABEL: Record<ValidationStatus, string> = {
  OK: '정상',
  CODE_MISSING: '코드 누락',
  ISSUE_OPEN: '검증 오류',
}

export const EXTERNAL_CODE_SOURCE_LABEL: Record<ExternalCodeSource, string> = {
  INVENTORY: '재고(WMS)',
  SHIPMENT: '선적(TMS)',
}

export const PRODUCT_PAGE_SIZE = 20

/** 분석이 보류된 지연이 없으면 null. 보완 수집이 들어와도 보류된 실행은 그대로여서 재분석 요청이 필요하다(D18). */
export const getProductErrorImpact = ({ affectedShipmentCodes }: Product) =>
  affectedShipmentCodes.length === 0
    ? null
    : `영향: ${affectedShipmentCodes.join(', ')} 분석 보류. 상품 정보를 보완해 다시 수집한 뒤, 지연 대응 센터에서 "재분석 요청"을 해 주세요.`

export const isCodeMissing = ({ externalCode }: ExternalCode) => externalCode === null

export const getProductErrorTitle = (product: Product) => {
  const sources = product.externalCodes
    .filter(isCodeMissing)
    .map(({ sourceDomain }) => EXTERNAL_CODE_SOURCE_LABEL[sourceDomain])

  return sources.length === 0
    ? '검증 오류가 있습니다'
    : `검증 오류: ${sources.join(', ')} 외부 코드가 매핑되지 않았습니다`
}

export const isProductError = (product: Product) => product.validationStatus !== 'OK'

export const filterProducts = (products: Product[], { query, onlyErrors }: ProductFilter) => {
  const keyword = query.trim().toLowerCase()

  return products.filter((product) => {
    if (onlyErrors && !isProductError(product)) {
      return false
    }
    return (
      !keyword ||
      product.name.toLowerCase().includes(keyword) ||
      product.erpCode.toLowerCase().includes(keyword)
    )
  })
}

type ProductTemplate = Omit<
  Product,
  'id' | 'externalCodes' | 'validationStatus' | 'affectedShipmentCodes'
> & {
  wmsCode: string
  tmsCode: string
}

const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    name: '세라마이드 크림',
    brandName: 'A Glow',
    category: '스킨케어',
    subcategory: '크림',
    hs10: '3304990000',
    unitsPerCase: 48,
    erpCode: 'SKU-CR-01',
    wmsCode: 'WMS-001',
    tmsCode: 'TMS-001',
    isEmergencyAirEligible: true,
    isHit: true,
  },
  {
    name: '수분 선크림',
    brandName: 'A Glow',
    category: '선케어',
    subcategory: '선크림',
    hs10: '3304990000',
    unitsPerCase: 72,
    erpCode: 'SKU-SN-02',
    wmsCode: 'WMS-002',
    tmsCode: 'TMS-002',
    isEmergencyAirEligible: true,
    isHit: true,
  },
  {
    name: '글로우 세럼',
    brandName: 'A Glow',
    category: '스킨케어',
    subcategory: '세럼',
    hs10: '3304990000',
    unitsPerCase: 60,
    erpCode: 'SKU-SR-03',
    wmsCode: 'WMS-003',
    tmsCode: 'TMS-003',
    isEmergencyAirEligible: true,
    isHit: false,
  },
  {
    name: '글로우쉽 시카 판테놀 수분 장벽 리페어 크림 기획세트 (본품 50ml + 미니 15ml x 2 + 쿠션 퍼프 증정) 대용량 리필 한정 에디션',
    brandName: 'A Glow',
    category: '스킨케어',
    subcategory: '크림',
    hs10: '3304990000',
    unitsPerCase: 12,
    erpCode: 'SKU-CR-04',
    wmsCode: 'WMS-004',
    tmsCode: 'TMS-004',
    isEmergencyAirEligible: false,
    isHit: false,
  },
]

const MOCK_PRODUCT_COUNT = 128
const MOCK_ERROR_INTERVAL = 63

// 오류 상품마다 분석이 보류된 지연이 다르다. 순서대로 돌려 쓴다.
const MOCK_AFFECTED_SHIPMENT_CODES = [['GS-1024'], ['GS-1025', 'GS-1026']]

// TODO: 연동 데이터 API 명세 확정 후 서버 응답으로 교체
export const PRODUCTS: Product[] = Array.from({ length: MOCK_PRODUCT_COUNT }, (_, index) => {
  const { wmsCode, tmsCode, ...template } = PRODUCT_TEMPLATES[index % PRODUCT_TEMPLATES.length]
  const hasMissingCode = index % MOCK_ERROR_INTERVAL === 0

  return {
    ...template,
    id: `product-${index + 1}`,
    externalCodes: [
      {
        sourceDomain: 'INVENTORY',
        externalCode: hasMissingCode ? null : wmsCode,
        mappingStatus: hasMissingCode ? 'UNMAPPED' : 'MAPPED',
      },
      { sourceDomain: 'SHIPMENT', externalCode: tmsCode, mappingStatus: 'MAPPED' },
    ],
    validationStatus: hasMissingCode ? 'CODE_MISSING' : 'OK',
    affectedShipmentCodes: hasMissingCode
      ? MOCK_AFFECTED_SHIPMENT_CODES[
          (index / MOCK_ERROR_INTERVAL) % MOCK_AFFECTED_SHIPMENT_CODES.length
        ]
      : [],
  }
})
