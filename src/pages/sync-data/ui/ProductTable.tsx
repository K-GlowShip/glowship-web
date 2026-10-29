import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import { isProductError, PRODUCT_STATUS_LABEL, type Product } from '../model/products'

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>상품</TableHead>
          <TableHead>ERP 코드</TableHead>
          <TableHead>LA / NJ 창고 코드</TableHead>
          <TableHead>히트 상품</TableHead>
          <TableHead>검증 상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-48pxr text-center text-muted-foreground">
              조건에 맞는 상품이 없습니다.
            </TableCell>
          </TableRow>
        )}
        {products.map((product) => {
          const isError = isProductError(product)

          return (
            <TableRow key={product.id} className={cn(isError && 'bg-muted')}>
              <TableCell className="font-bold text-primary">{product.name}</TableCell>
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
