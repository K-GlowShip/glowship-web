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
  isProductError,
  VALIDATION_STATUS_LABEL,
  type Product,
} from '../model/products'

interface ProductTableProps {
  products: Product[]
  onSelect: (product: Product) => void
}

export function ProductTable({ products, onSelect }: ProductTableProps) {
  return (
    <Table className="min-w-1010pxr">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-300pxr">상품</TableHead>
          <TableHead className="w-140pxr">ERP 코드</TableHead>
          <TableHead className="w-210pxr">외부 코드</TableHead>
          <TableHead className="w-100pxr">히트 상품</TableHead>
          <TableHead className="w-120pxr">긴급 항공 가능</TableHead>
          <TableHead className="w-140pxr">검증 상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 && (
          <TableEmptyRow colSpan={6}>조건에 맞는 상품이 없습니다.</TableEmptyRow>
        )}
        {products.map((product) => {
          const isError = isProductError(product)

          return (
            <TableRow
              key={product.id}
              className="cursor-pointer hover:bg-background"
              onClick={() => onSelect(product)}
            >
              <TableCell className="wrap-break-word">
                <button
                  type="button"
                  className="cursor-pointer text-left outline-none focus-visible:underline"
                  aria-label={`${product.name} 상세 보기`}
                >
                  {product.name}
                </button>
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
              <TableCell>{product.isEmergencyAirEligible ? '가능' : '불가'}</TableCell>
              <TableCell>
                <Badge variant={isError ? 'danger' : 'success'}>
                  {VALIDATION_STATUS_LABEL[product.validationStatus]}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
