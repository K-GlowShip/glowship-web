import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import {
  DELAY_COUNT_KEY,
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  formatRoute,
  getRegionLabel,
  getStageLabel,
  toDelayStatus,
} from '@/entities/delay-event'
import { delayEventQueries } from '@/shared/api'
import { EMPTY_VALUE, ROUTES, delayCenterListPath, delayCenterPath } from '@/shared/config'
import { formatMMDD } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableQueryRows,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { DELAY_PREVIEW_SIZE, DELAY_STATUS_ORDER } from '../model/dashboard'

export function DelayTable() {
  // 최종 선택 전인 지연 중 최근 감지된 건. 상태별 건수(`counts`)는 같은 응답에 들어 있다
  const query = useQuery(
    delayEventQueries.list({ hasFinalDecision: false, size: DELAY_PREVIEW_SIZE }),
  )
  const counts = query.data?.counts

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-12pxr">
          <CardTitle as="h2">대응이 필요한 지연</CardTitle>
          <p className="text-caption text-muted-foreground">최근 {DELAY_PREVIEW_SIZE}건만 표시</p>
        </div>
        <Link to={ROUTES.DELAY_CENTER} className="text-b2 text-primary hover:underline">
          지연 대응 센터에서 보기 →
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-16pxr pt-16pxr">
        <ul
          aria-label="상태별 지연 건수, 누르면 해당 상태 목록으로 이동"
          className="grid grid-cols-2 gap-16pxr lg:grid-cols-4"
        >
          {DELAY_STATUS_ORDER.map((status) => (
            <li key={status}>
              <Link
                to={delayCenterListPath(status)}
                className="group flex items-center justify-between gap-8pxr rounded-card border border-transparent bg-primary-50 px-16pxr py-12pxr transition-colors outline-none hover:border-primary-300 hover:bg-primary-100 focus-visible:ring-[3px] focus-visible:ring-primary/30"
              >
                <Badge variant={DELAY_STATUS_BADGE_VARIANT[status]}>
                  {DELAY_STATUS_LABEL[status]}
                </Badge>
                <span className="flex items-center gap-4pxr">
                  <span className="text-h3 font-bold">
                    {counts ? `${counts[DELAY_COUNT_KEY[status]]}건` : EMPTY_VALUE}
                  </span>
                  <ChevronRight
                    className="size-16pxr text-muted-foreground group-hover:text-primary group-focus-visible:text-primary"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="overflow-x-auto">
          <Table className="min-w-900pxr">
            <TableHeader>
              <TableRow>
                <TableHead className="w-160pxr">선적 번호</TableHead>
                <TableHead className="w-200pxr">상품</TableHead>
                <TableHead className="w-180pxr">경로 · 운송 단계</TableHead>
                <TableHead className="w-100pxr">입고 창고</TableHead>
                <TableHead className="w-140pxr">계획 → 예상 입고</TableHead>
                <TableHead className="w-80pxr whitespace-nowrap">지연</TableHead>
                <TableHead className="w-90pxr">위험 주문</TableHead>
                <TableHead className="w-120pxr">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableQueryRows
                query={query}
                colSpan={8}
                emptyMessage="대응이 필요한 지연이 없습니다."
              >
                {(delays) =>
                  delays.map((delay) => {
                    const status = toDelayStatus(delay.currentRun?.status)

                    return (
                      <TableRow key={delay.delayEventId}>
                        <TableCell className="whitespace-nowrap">
                          <Link
                            to={delayCenterPath(delay.delayEventId)}
                            className="underline underline-offset-2"
                          >
                            {delay.shipment.shipmentCode}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {delay.representativeSku?.productName ?? EMPTY_VALUE}
                          {delay.skuCount > 1 && (
                            <span className="text-muted-foreground">
                              {' '}
                              외 {delay.skuCount - 1}개
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatRoute(delay)}
                          <p className="text-caption text-muted-foreground">
                            {getStageLabel(delay.stage)}
                          </p>
                        </TableCell>
                        <TableCell>{getRegionLabel(delay.warehouse.regionCode)}</TableCell>
                        <TableCell>
                          {formatMMDD(delay.planned3plInboundDate)} →{' '}
                          {formatMMDD(delay.expected3plInboundDate)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">+{delay.delayDays}일</TableCell>
                        <TableCell>
                          {delay.atRiskOrderCount === null
                            ? EMPTY_VALUE
                            : `${delay.atRiskOrderCount}건`}
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
                      </TableRow>
                    )
                  })
                }
              </TableQueryRows>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
