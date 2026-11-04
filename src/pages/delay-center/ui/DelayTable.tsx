import { Link, useNavigate } from 'react-router'

import { delayCenterPath } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
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
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  type DelayCase,
  type DelayListLocationState,
  formatMonthDay,
  getAtRiskOrderCount,
  formatProductLabel,
  formatRoute,
  STAGE_LABEL,
} from '../model/delay-center'

interface DelayTableProps {
  cases: DelayCase[]
  /** 현재 목록 주소의 `?` 뒤 문자열. 상세에서 돌아올 때 검색 조건을 되살리는 데 쓴다. */
  listSearch: string
}

const COLUMN_COUNT = 7
const EMPTY = '—'

/** 계산 결과가 없는 건은 '—'로 표시한다. 결과가 있으면 0건도 숫자다. */
const formatAtRiskOrders = (delayCase: DelayCase) => {
  const count = getAtRiskOrderCount(delayCase)
  return count === null ? EMPTY : `${count}건`
}

/** 지연 목록. 행을 누르면 그 지연 건의 상세 화면으로 이동한다. */
export function DelayTable({ cases, listSearch }: DelayTableProps) {
  const navigate = useNavigate()
  const state: DelayListLocationState = { listSearch }

  return (
    <Table className="min-w-1040pxr">
      <TableHeader>
        <TableRow>
          <TableHead>선적 / 상품</TableHead>
          <TableHead className="w-140pxr">상태</TableHead>
          <TableHead className="w-80pxr">지연</TableHead>
          <TableHead className="w-160pxr">운송 단계</TableHead>
          <TableHead className="w-170pxr">입고 (계획 → 예상)</TableHead>
          <TableHead className="w-90pxr">위험 주문</TableHead>
          <TableHead className="w-140pxr">감지 시각</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.length === 0 && (
          <TableEmptyRow colSpan={COLUMN_COUNT}>조건에 맞는 지연이 없습니다.</TableEmptyRow>
        )}
        {cases.map((delayCase) => (
          <TableRow
            key={delayCase.id}
            className="cursor-pointer hover:bg-background"
            onClick={() => navigate(delayCenterPath(delayCase.id), { state })}
          >
            <TableCell className="wrap-break-word">
              <Link
                to={delayCenterPath(delayCase.id)}
                state={state}
                className="font-bold outline-none focus-visible:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {delayCase.shipmentCode}
              </Link>{' '}
              <span className="text-muted-foreground">{formatProductLabel(delayCase)}</span>
            </TableCell>
            <TableCell>
              <Badge variant={DELAY_STATUS_BADGE_VARIANT[delayCase.status]}>
                {DELAY_STATUS_LABEL[delayCase.status]}
              </Badge>
            </TableCell>
            <TableCell className={cn(delayCase.delayDays > 0 && 'font-bold text-danger')}>
              {delayCase.delayDays > 0 ? `+${delayCase.delayDays}일` : EMPTY}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{STAGE_LABEL[delayCase.stage]}</span>
                <span className="text-caption text-muted-foreground">{formatRoute(delayCase)}</span>
              </div>
            </TableCell>
            <TableCell>
              {formatMonthDay(delayCase.plannedInbound)} →{' '}
              {formatMonthDay(delayCase.expectedInbound)}
            </TableCell>
            <TableCell>{formatAtRiskOrders(delayCase)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatYYYYMMDDHHmm(delayCase.detectedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
