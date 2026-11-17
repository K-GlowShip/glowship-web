import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

import type { LeadTimeCell, LeadTimeMatrix } from '../model/operating-rule-text'

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

/** 리드타임 표 하나: 행은 창고, 열은 도착 권역(또는 처리 종류). 값이 없는 조합은 '해당 없음'으로 둔다 */
export function LeadTimeMatrixTable({
  matrix,
  columnClassName,
  renderCell,
  renderEmpty,
}: LeadTimeMatrixTableProps) {
  return (
    <table className="w-full table-fixed text-b1">
      <thead>
        <tr className="border-b border-border">
          <th scope="col" className="py-8pxr text-left text-b2 font-bold">
            {matrix.title}
          </th>
          {matrix.columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={cn(
                'py-8pxr text-right text-caption font-normal text-muted-foreground',
                columnClassName,
              )}
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
              {warehouse.warehouseCode}
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
