import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { type Sku, skuQueries } from '@/shared/api'
import { useDetailDialog } from '@/shared/lib/use-detail-dialog'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'

import { useListParams } from '../model/use-list-params'
import { DataTabLayout } from './DataTabLayout'
import { ProductDetailDialog } from './ProductDetailDialog'
import { ProductTable } from './ProductTable'

export function ProductTab() {
  const list = useListParams()
  const [onlyErrors, setOnlyErrors] = useState(false)
  const detailDialog = useDetailDialog<Sku>()
  const query = useQuery(skuQueries.list({ ...list.params, onlyErrors: onlyErrors || undefined }))

  return (
    <>
      <DataTabLayout
        searchId="product-search"
        searchLabel="상품 검색"
        searchPlaceholder="상품명 또는 ERP 코드"
        input={list.input}
        onInputChange={list.onInputChange}
        onSubmit={() => list.onSubmit(query.refetch)}
        query={query}
        page={list.page}
        onPageChange={list.onPageChange}
        Controls={
          <>
            <Checkbox
              id="only-errors"
              checked={onlyErrors}
              onCheckedChange={(checked) => {
                setOnlyErrors(checked === true)
                list.onPageChange(1)
              }}
            />
            <Label htmlFor="only-errors" className="cursor-pointer text-b1 font-normal">
              오류만 보기
            </Label>
          </>
        }
      >
        <ProductTable query={query} onSelect={detailDialog.show} />
      </DataTabLayout>

      <ProductDetailDialog
        product={detailDialog.selected}
        open={detailDialog.open}
        onOpenChange={detailDialog.onOpenChange}
        onCloseAutoFocus={detailDialog.onCloseAutoFocus}
      />
    </>
  )
}
