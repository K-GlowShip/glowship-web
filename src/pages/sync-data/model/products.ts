export type ProductStatus = 'valid' | 'missing-code'

/** 상품 외부 코드를 내려주는 원천. 명세 v6.2 `GET /skus`의 `externalCodes[].sourceDomain` */
export type ExternalCodeSource = 'INVENTORY' | 'SHIPMENT'

/** 서버 `external_entity_mappings.mapping_status` 값 */
export type MappingStatus = 'PENDING' | 'MAPPED' | 'UNMAPPED'

export interface ExternalCode {
  sourceDomain: ExternalCodeSource
  /** 매핑되지 않은 원천은 null */
  externalCode: string | null
  mappingStatus: MappingStatus
}

export interface WarehouseStock {
  warehouseName: string
  /** 서버 `inventory_daily.available_quantity` */
  availableQuantity: number
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
  emergencyAirEligible: boolean
  stocks: WarehouseStock[]
  status: ProductStatus
}

export interface ProductFilter {
  query: string
  onlyErrors: boolean
}

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  valid: '정상',
  'missing-code': '코드 누락',
}

export const EXTERNAL_CODE_SOURCE_LABEL: Record<ExternalCodeSource, string> = {
  INVENTORY: '재고(WMS)',
  SHIPMENT: '선적(TMS)',
}

export const getTotalAvailableQuantity = ({ stocks }: Product) =>
  stocks.reduce((total, { availableQuantity }) => total + availableQuantity, 0)

export const PRODUCT_PAGE_SIZE = 20

export const PRODUCT_ERROR_NOTICE = {
  impact:
    '영향: GS-1024 재고 전환 분석 보류. ERP 상품 정보를 보완한 뒤 다시 수집하면 자동 재분석합니다.',
}

export const isCodeMissing = ({ mappingStatus }: ExternalCode) => mappingStatus !== 'MAPPED'

export const getProductErrorTitle = (product: Product) => {
  const sources = product.externalCodes
    .filter(isCodeMissing)
    .map(({ sourceDomain }) => EXTERNAL_CODE_SOURCE_LABEL[sourceDomain])

  return `검증 오류: ${sources.join(', ')} 외부 코드가 매핑되지 않았습니다`
}

export const isProductError = (product: Product) => product.status !== 'valid'

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

const PRODUCT_TEMPLATES = [
  {
    name: '세라마이드 크림',
    brandName: 'A뷰티',
    category: '스킨케어',
    subcategory: '크림',
    hs10: '3304990000',
    unitsPerCase: 48,
    erpCode: 'SKU-CR-01',
    wmsCode: 'WMS-001',
    tmsCode: 'TMS-001',
    stocks: [
      { warehouseName: 'LA', availableQuantity: 1200 },
      { warehouseName: 'NJ', availableQuantity: 800 },
    ],
    emergencyAirEligible: true,
    isHit: true,
  },
  {
    name: '수분 선크림',
    brandName: 'A뷰티',
    category: '선케어',
    subcategory: '선크림',
    hs10: '3304990000',
    unitsPerCase: 72,
    erpCode: 'SKU-SN-02',
    wmsCode: 'WMS-002',
    tmsCode: 'TMS-002',
    stocks: [
      { warehouseName: 'LA', availableQuantity: 2400 },
      { warehouseName: 'NJ', availableQuantity: 1600 },
    ],
    emergencyAirEligible: true,
    isHit: true,
  },
  {
    name: '글로우 세럼',
    brandName: 'A뷰티',
    category: '스킨케어',
    subcategory: '세럼',
    hs10: '3304990000',
    unitsPerCase: 60,
    erpCode: 'SKU-SR-03',
    wmsCode: 'WMS-003',
    tmsCode: 'TMS-003',
    stocks: [
      { warehouseName: 'LA', availableQuantity: 900 },
      { warehouseName: 'NJ', availableQuantity: 300 },
    ],
    emergencyAirEligible: true,
    isHit: false,
  },
  {
    name: '글로우쉽 시카 판테놀 수분 장벽 리페어 크림 기획세트 (본품 50ml + 미니 15ml x 2 + 쿠션 퍼프 증정) 대용량 리필 한정 에디션',
    brandName: 'A뷰티',
    category: '스킨케어',
    subcategory: '크림',
    hs10: '3304990000',
    unitsPerCase: 12,
    erpCode: 'SKU-CR-04',
    wmsCode: 'WMS-004',
    tmsCode: 'TMS-004',
    stocks: [
      { warehouseName: 'LA', availableQuantity: 150 },
      { warehouseName: 'NJ', availableQuantity: 0 },
    ],
    emergencyAirEligible: false,
    isHit: false,
  },
]

const MOCK_PRODUCT_COUNT = 128
const MOCK_ERROR_INTERVAL = 63

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
    status: hasMissingCode ? 'missing-code' : 'valid',
  }
})
