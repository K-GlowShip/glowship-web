export type ProductStatus = 'valid' | 'missing-code'

export interface Product {
  id: string
  name: string
  erpCode: string
  laCode: string
  njCode: string | null
  isHit: boolean
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

export const PRODUCT_PAGE_SIZE = 20

export const PRODUCT_ERROR_NOTICE = {
  title: '검증 오류: NJ 창고 코드가 누락되었습니다',
  impact:
    '영향: GS-1024 재고 전환 분석 보류. ERP 상품 정보를 보완한 뒤 다시 수집하면 자동 재분석합니다.',
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
    erpCode: 'SKU-CR-01',
    laCode: 'LA-001',
    njCode: 'NJ-001',
    isHit: true,
  },
  { name: '수분 선크림', erpCode: 'SKU-SN-02', laCode: 'LA-002', njCode: 'NJ-002', isHit: true },
  { name: '글로우 세럼', erpCode: 'SKU-SR-03', laCode: 'LA-003', njCode: 'NJ-003', isHit: false },
  {
    name: '글로우쉽 시카 판테놀 수분 장벽 리페어 크림 기획세트 (본품 50ml + 미니 15ml x 2 + 쿠션 퍼프 증정) 대용량 리필 한정 에디션',
    erpCode: 'SKU-CR-04',
    laCode: 'LA-004',
    njCode: 'NJ-004',
    isHit: false,
  },
]

const MOCK_PRODUCT_COUNT = 128
const MOCK_ERROR_INTERVAL = 63

// TODO: 연동 데이터 API 명세 확정 후 서버 응답으로 교체
export const PRODUCTS: Product[] = Array.from({ length: MOCK_PRODUCT_COUNT }, (_, index) => {
  const template = PRODUCT_TEMPLATES[index % PRODUCT_TEMPLATES.length]
  const hasMissingCode = index % MOCK_ERROR_INTERVAL === 0

  return {
    ...template,
    id: `product-${index + 1}`,
    njCode: hasMissingCode ? null : template.njCode,
    status: hasMissingCode ? 'missing-code' : 'valid',
  }
})
