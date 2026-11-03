import { CircleAlert } from 'lucide-react'
import { Fragment } from 'react'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

import {
  EXTERNAL_CODE_SOURCE_LABEL,
  getProductErrorTitle,
  isCodeMissing,
  PRODUCT_ERROR_NOTICE,
  type Product,
} from '../model/products'

interface ProductErrorDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductErrorDialog({ product, open, onOpenChange }: ProductErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        {product && <ProductError product={product} />}
      </DialogContent>
    </Dialog>
  )
}

function ProductError({ product }: { product: Product }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
      </DialogHeader>

      <DialogBody className="flex flex-col gap-16pxr">
        <dl className="grid grid-cols-[auto_1fr] gap-x-24pxr gap-y-8pxr text-b1">
          <dt className="text-muted-foreground">ERP 코드</dt>
          <dd>{product.erpCode}</dd>
          <dt className="text-muted-foreground">HS 코드</dt>
          <dd>{product.hs10}</dd>
          <dt className="text-muted-foreground">입수량</dt>
          <dd>박스당 {product.unitsPerCase.toLocaleString('ko-KR')}개</dd>
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

        <div className="flex items-start gap-12pxr rounded-card bg-danger-bg p-16pxr text-danger">
          <CircleAlert className="mt-2pxr size-20pxr shrink-0" aria-hidden="true" />
          <div>
            <p className="text-b1 font-bold">{getProductErrorTitle(product)}</p>
            <p className="text-b2">{PRODUCT_ERROR_NOTICE.impact}</p>
          </div>
        </div>
      </DialogBody>
    </>
  )
}
