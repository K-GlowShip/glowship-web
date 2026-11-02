import { CircleAlert, Search } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { TableTemplate } from '@/shared/ui/table-template'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import {
  filterProducts,
  isProductError,
  PRODUCT_ERROR_NOTICE,
  PRODUCT_PAGE_SIZE,
  PRODUCTS,
} from '../model/products'
import { ProductTable } from './ProductTable'

const PRODUCT_ERROR_COUNT = PRODUCTS.filter(isProductError).length

// TODO: 주문·재고·선적 탭 디자인 확정 후 구현
const TABS = [
  { value: 'order', label: '주문' },
  { value: 'inventory', label: '재고' },
  { value: 'shipment', label: '선적' },
]

export function ProductPanel() {
  const [query, setQuery] = useState('')
  const [onlyErrors, setOnlyErrors] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = filterProducts(PRODUCTS, { query, onlyErrors })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PRODUCT_PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageProducts = filtered.slice(
    (currentPage - 1) * PRODUCT_PAGE_SIZE,
    currentPage * PRODUCT_PAGE_SIZE,
  )

  return (
    <Card className="rounded-panel">
      <CardContent className="p-32pxr">
        <Tabs defaultValue="product">
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="product">
              상품
              {PRODUCT_ERROR_COUNT > 0 && <span>{PRODUCT_ERROR_COUNT}</span>}
            </TabsTrigger>
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <p className="py-48pxr text-center text-muted-foreground">
                {tab.label} 데이터 조회는 준비 중입니다.
              </p>
            </TabsContent>
          ))}

          <TabsContent value="product" className="flex flex-col gap-16pxr pt-24pxr">
            <div className="flex flex-col gap-8pxr">
              <Label htmlFor="product-search">상품 검색</Label>
              <div className="relative max-w-500pxr">
                <Search
                  className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="product-search"
                  className="h-48pxr pl-40pxr"
                  placeholder="상품명 또는 ERP 코드"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>

            <TableTemplate
              totalCount={filtered.length}
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
              Controls={
                <>
                  <Checkbox
                    id="only-errors"
                    checked={onlyErrors}
                    onCheckedChange={(checked) => {
                      setOnlyErrors(checked === true)
                      setPage(1)
                    }}
                  />
                  <Label htmlFor="only-errors" className="cursor-pointer text-b1 font-normal">
                    오류만 보기
                  </Label>
                </>
              }
            >
              <ProductTable products={pageProducts} />
            </TableTemplate>

            {PRODUCT_ERROR_COUNT > 0 && (
              <div
                role="alert"
                className="flex items-start gap-12pxr rounded-card bg-danger-bg p-20pxr text-danger"
              >
                <CircleAlert className="mt-2pxr size-20pxr shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-b1 font-bold">{PRODUCT_ERROR_NOTICE.title}</p>
                  <p className="text-b2">{PRODUCT_ERROR_NOTICE.impact}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
