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

import { isProductError, PRODUCT_STATUS_LABEL, type Product } from '../model/products'

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <Table className="min-w-800pxr">
      <TableHeader>
        <TableRow>
          <TableHead>상품</TableHead>
          <TableHead className="w-160pxr">ERP 코드</TableHead>
          <TableHead className="w-220pxr">LA / NJ 창고 코드</TableHead>
          <TableHead className="w-120pxr">히트 상품</TableHead>
          <TableHead className="w-140pxr">검증 상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 && (
          <TableEmptyRow colSpan={5}>조건에 맞는 상품이 없습니다.</TableEmptyRow>
        )}
        {products.map((product) => {
          const isError = isProductError(product)

          return (
            <TableRow key={product.id} className={cn(isError && 'bg-muted')}>
              <TableCell className="font-bold wrap-break-word text-primary">
                {product.name}
              </TableCell>
              <TableCell>{product.erpCode}</TableCell>
              <TableCell>
                {product.laCode} / {product.njCode ?? '—'}
              </TableCell>
              <TableCell>{product.isHit ? '예' : '아니오'}</TableCell>
              <TableCell>
                <Badge variant={isError ? 'danger' : 'success'}>
                  {PRODUCT_STATUS_LABEL[product.status]}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
