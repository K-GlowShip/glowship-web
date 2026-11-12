import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import {
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  formatRoute,
  getStageLabel,
  toDelayStatus,
} from '@/entities/delay-event'
import type { DelayEventListItem } from '@/shared/api'
import { EMPTY_VALUE, delayCenterPath } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm, formatMMDD } from '@/shared/lib/kst-date'
import { formatNumber } from '@/shared/lib/format-number'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  type ListQuery,
  TableQueryRows,
  TableRow,
} from '@/shared/ui/table'

import { type DelayListLocationState } from '../model/delay-center'

interface DelayTableProps {
  query: ListQuery<DelayEventListItem>
  /** 현재 목록 주소의 `?` 뒤 문자열. 상세에서 돌아올 때 검색 조건을 되살리는 데 쓴다. */
  listSearch: string
}

const COLUMN_COUNT = 8

/** 지연 목록. 행을 누르면 그 지연 건의 상세 화면으로 이동한다. */
export function DelayTable({ query, listSearch }: DelayTableProps) {
  const navigate = useNavigate()
  const state: DelayListLocationState = { listSearch }

  return (
    <Table className="min-w-1070pxr">
      <TableHeader>
        <TableRow>
          <TableHead>선적 / 상품</TableHead>
          <TableHead className="w-130pxr">상태</TableHead>
          <TableHead className="w-90pxr text-right">지연</TableHead>
          <TableHead className="w-190pxr pl-40pxr">운송 단계</TableHead>
          <TableHead className="w-160pxr">입고 (계획 → 예상)</TableHead>
          <TableHead className="w-90pxr text-right">위험 주문</TableHead>
          <TableHead className="w-160pxr pl-32pxr">감지 시각</TableHead>
          <TableHead className="w-48pxr">
            <span className="sr-only">상세 보기</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableQueryRows
          query={query}
          colSpan={COLUMN_COUNT}
          emptyMessage="조건에 맞는 지연이 없습니다."
        >
          {(delays) =>
            delays.map((delay) => {
              const status = toDelayStatus(delay.currentRun?.status)

              return (
                <TableRow
                  key={delay.delayEventId}
                  className="group cursor-pointer hover:bg-background"
                  onClick={() => navigate(delayCenterPath(delay.delayEventId), { state })}
                >
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <Link
                        to={delayCenterPath(delay.delayEventId)}
                        state={state}
                        className="w-fit font-bold outline-none focus-visible:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {delay.shipment.shipmentCode}
                      </Link>
                      <span className="truncate text-b2 text-muted-foreground">
                        {delay.representativeSku?.productName ?? EMPTY_VALUE}
                        {delay.skuCount > 1 && ` 외 ${formatNumber(delay.skuCount - 1)}개`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {status ? (
                      <Badge variant={DELAY_STATUS_BADGE_VARIANT[status]}>
                        {DELAY_STATUS_LABEL[status]}
                      </Badge>
                    ) : (
                      EMPTY_VALUE
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right whitespace-nowrap tabular-nums',
                      delay.delayDays > 0 ? 'font-bold text-danger' : 'text-muted-foreground',
                    )}
                  >
                    {delay.delayDays > 0 ? `+${delay.delayDays}일` : EMPTY_VALUE}
                  </TableCell>
                  <TableCell className="pl-40pxr">
                    <div className="flex flex-col">
                      <span>{getStageLabel(delay.stage)}</span>
                      <span className="text-caption whitespace-nowrap text-muted-foreground">
                        {formatRoute(delay)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">
                    <span className="text-muted-foreground">
                      {formatMMDD(delay.planned3plInboundDate)} →
                    </span>{' '}
                    <span className="font-bold">{formatMMDD(delay.expected3plInboundDate)}</span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right tabular-nums',
                      !delay.atRiskOrderCount && 'text-muted-foreground',
                    )}
                  >
                    {delay.atRiskOrderCount === null
                      ? EMPTY_VALUE
                      : `${formatNumber(delay.atRiskOrderCount)}건`}
                  </TableCell>
                  <TableCell className="pl-32pxr whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatYYYYMMDDHHmm(delay.detectedAt)}
                  </TableCell>
                  <TableCell className="px-0">
                    <ChevronRight
                      className="size-18pxr text-input transition-colors group-hover:text-primary group-has-[a:focus-visible]:text-primary"
                      aria-hidden="true"
                    />
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableQueryRows>
      </TableBody>
    </Table>
  )
}
