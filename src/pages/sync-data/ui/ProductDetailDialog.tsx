import { useQuery } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import { Fragment } from 'react'

import { type Sku, skuQueries } from '@/shared/api'
import { formatNumber } from '@/shared/lib/format-number'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  EXTERNAL_CODE_SOURCE_LABEL,
  getProductErrorImpact,
  getProductErrorTitle,
  isCodeMissing,
  isProductError,
} from '../model/products'

interface ProductDetailDialogProps {
  product: Sku | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: ProductDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} onCloseAutoFocus={onCloseAutoFocus}>
        {product && <ProductDetail product={product} />}
      </DialogContent>
    </Dialog>
  )
}

function ProductDetail({ product }: { product: Sku }) {
  const hasError = isProductError(product)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product.productName}</DialogTitle>
      </DialogHeader>

      <DialogBody className="flex flex-col gap-16pxr">
        <dl className="grid grid-cols-[auto_1fr] gap-x-24pxr gap-y-8pxr text-b1">
          <dt className="text-muted-foreground">ERP 코드</dt>
          <dd>{product.skuCode}</dd>
          <dt className="text-muted-foreground">HS 코드</dt>
          <dd>{product.hs10}</dd>
          <dt className="text-muted-foreground">입수량</dt>
          <dd>박스당 {formatNumber(product.unitsPerCase)}개</dd>
          {product.externalCodes.map((code) => (
            <Fragment key={code.sourceDomain}>
              <dt className="text-muted-foreground">
                {EXTERNAL_CODE_SOURCE_LABEL[code.sourceDomain]} 코드
              </dt>
              <dd className={isCodeMissing(code) ? 'font-bold text-danger' : undefined}>
                {code.externalCode ?? '누락'}
              </dd>
            </Fragment>
          ))}
        </dl>

        {hasError && <ProductError product={product} />}
      </DialogBody>
    </>
  )
}

/** 검증 오류 안내. 열린 오류와 영향받는 지연은 상세 API에서 받아 온다. */
function ProductError({ product }: { product: Sku }) {
  const { data: detail, error, isPending } = useQuery(skuQueries.detail(product.skuId))
  const impact = detail ? getProductErrorImpact(detail) : null

  return (
    <div className="flex items-start gap-12pxr rounded-card bg-danger-bg p-16pxr text-danger">
      <CircleAlert className="mt-2pxr size-20pxr shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-4pxr">
        <p className="text-b1 font-bold">{getProductErrorTitle(product)}</p>
        {isPending && <Skeleton className="h-16pxr w-full bg-danger/10" />}
        {error && <p className="text-b2">오류 상세를 불러오지 못했습니다.</p>}
        {detail && detail.issues.length > 0 && (
          <ul className="list-disc pl-20pxr text-b2">
            {detail.issues.map((issue) => (
              <li key={issue.dataValidationIssueId} className="wrap-break-word">
                {issue.errorMessage}
              </li>
            ))}
          </ul>
        )}
        {impact && <p className="text-b2">{impact}</p>}
      </div>
    </div>
  )
}
