import { ChevronRight } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import {
  EXTERNAL_CODE_SOURCE_LABEL,
  getTotalAvailableQuantity,
  isProductError,
  PRODUCT_STATUS_LABEL,
  type Product,
} from '../model/products'

interface ProductTableProps {
  products: Product[]
  onSelectError: (product: Product) => void
}

export function ProductTable({ products, onSelectError }: ProductTableProps) {
  return (
    <Table className="min-w-1210pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-300pxr">상품</TableHead>
          <TableHead className="w-140pxr">ERP 코드</TableHead>
          <TableHead className="w-210pxr">외부 코드</TableHead>
          <TableHead className="w-100pxr whitespace-nowrap">히트 상품</TableHead>
          <TableHead className="w-120pxr whitespace-nowrap">긴급 항공 가능</TableHead>
          <TableHead className="w-200pxr">가용 재고</TableHead>
          <TableHead className="w-140pxr">검증 상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 && (
          <TableEmptyRow colSpan={7}>조건에 맞는 상품이 없습니다.</TableEmptyRow>
        )}
        {products.map((product) => {
          const isError = isProductError(product)

          return (
            <TableRow
              key={product.id}
              className={cn(isError && 'group cursor-pointer hover:bg-background')}
              onClick={isError ? () => onSelectError(product) : undefined}
            >
              <TableCell className="wrap-break-word">
                {isError ? (
                  <button
                    type="button"
                    className="cursor-pointer text-left outline-none focus-visible:underline"
                    aria-label={`${product.name} 오류 상세 보기`}
                  >
                    {product.name}
                  </button>
                ) : (
                  product.name
                )}
                <p className="text-b2 text-muted-foreground">
                  {product.brandName} · {product.category} / {product.subcategory}
                </p>
              </TableCell>
              <TableCell>{product.erpCode}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-2pxr">
                  {product.externalCodes.map((code) => (
                    <span key={code.sourceDomain}>
                      <span className="text-muted-foreground">
                        {EXTERNAL_CODE_SOURCE_LABEL[code.sourceDomain]}:{' '}
                      </span>
                      {code.externalCode ?? '—'}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>{product.isHit ? '예' : '아니오'}</TableCell>
              <TableCell>{product.emergencyAirEligible ? '가능' : '불가'}</TableCell>
              <TableCell>
                {getTotalAvailableQuantity(product).toLocaleString('ko-KR')}
                <p className="text-b2 text-muted-foreground">
                  {product.stocks
                    .map(
                      ({ warehouseName, availableQuantity }) =>
                        `${warehouseName} ${availableQuantity.toLocaleString('ko-KR')}`,
                    )
                    .join(' · ')}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4pxr">
                  <Badge variant={isError ? 'danger' : 'success'}>
                    {PRODUCT_STATUS_LABEL[product.status]}
                  </Badge>
                  {isError && (
                    <ChevronRight
                      className="size-16pxr text-muted-foreground group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
