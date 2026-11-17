import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

import {
  getWarehouseRegionLabel,
  type LeadTimeCell,
  type LeadTimeMatrix,
} from '../model/operating-rule-text'

interface LeadTimeMatrixTableProps {
  matrix: LeadTimeMatrix
  /** 값 열의 너비. 읽기 전용은 좁게, 입력칸이 들어가면 넓게 준다 */
  columnClassName: string
  renderCell: (cell: LeadTimeCell) => ReactNode
  /** 값이 없는 조합의 칸. 생략하면 '해당 없음' 글자만 보인다 */
  renderEmpty?: () => ReactNode
}

/** 줄표(–)는 숫자 옆에서 마이너스 부호처럼 읽혀서 글자로 적는다 */
function EmptyCellText() {
  return <span className="text-caption text-muted-foreground">해당 없음</span>
}

/** 리드타임 표 하나: 제목 아래에 행은 창고, 열은 도착 권역(또는 처리 종류). 값이 없는 조합은 '해당 없음'으로 둔다 */
export function LeadTimeMatrixTable({
  matrix,
  columnClassName,
  renderCell,
  renderEmpty,
}: LeadTimeMatrixTableProps) {
  return (
    <table className="w-full table-fixed text-b1">
      <caption className="pb-4pxr text-left text-b2 font-bold">{matrix.title}</caption>
      <thead>
        {/* 어느 쪽이 출발이고 어느 쪽이 도착인지 머리글에서 바로 읽히게 한다 */}
        <tr className="border-b border-border text-caption text-muted-foreground">
          <th scope="col" className="py-6pxr text-left font-normal">
            {matrix.rowHeader}
          </th>
          {matrix.columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={cn('py-6pxr text-right font-normal', columnClassName)}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.rows.map(({ warehouse, cells }) => (
          <tr key={warehouse.warehouseId} className="border-b border-border last:border-b-0">
            <th scope="row" className="py-8pxr text-left font-normal">
              {/* 권역이 먼저, 코드는 옆에 작게(좁으면 통째로 아랫줄로). 권역을 모르는 창고는 코드만 보인다 */}
              <span className="inline-flex flex-wrap items-baseline gap-x-6pxr">
                <span className="whitespace-nowrap">
                  {getWarehouseRegionLabel(warehouse) ?? warehouse.warehouseCode}
                </span>
                {getWarehouseRegionLabel(warehouse) && (
                  <span className="text-caption whitespace-nowrap text-muted-foreground">
                    {warehouse.warehouseCode}
                  </span>
                )}
              </span>
            </th>
            {cells.map((cell, index) => (
              <td key={matrix.columns[index].key} className="py-8pxr text-right">
                {cell ? renderCell(cell) : (renderEmpty?.() ?? <EmptyCellText />)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
