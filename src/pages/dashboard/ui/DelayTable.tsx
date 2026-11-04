import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import {
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  REGION_LABEL,
  STAGE_LABEL,
} from '@/entities/delay-event'
import { delayCenterListPath, delayCenterPath, ROUTES } from '@/shared/config'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
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
  DELAY_PREVIEW_SIZE,
  DELAY_STATUS_ORDER,
  formatMonthDay,
  type DelayListResult,
} from '../model/dashboard'

export function DelayTable({ delays }: { delays: DelayListResult }) {
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
                  <span className="text-h3 font-bold">{delays.counts[status]}건</span>
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
              {delays.items.length === 0 && (
                <TableEmptyRow colSpan={8}>대응이 필요한 지연이 없습니다.</TableEmptyRow>
              )}
              {delays.items.map((delay) => (
                <TableRow key={delay.delayEventId}>
                  <TableCell className="whitespace-nowrap">
                    <Link
                      to={delayCenterPath(delay.delayEventId)}
                      className="hover:underline focus-visible:underline"
                    >
                      {delay.shipmentCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {delay.productName ?? '-'}
                    {delay.skuCount > 1 && (
                      <span className="text-muted-foreground"> 외 {delay.skuCount - 1}개</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {delay.route}
                    <p className="text-caption text-muted-foreground">{STAGE_LABEL[delay.stage]}</p>
                  </TableCell>
                  <TableCell>{REGION_LABEL[delay.warehouseRegion]}</TableCell>
                  <TableCell>
                    {formatMonthDay(delay.planned3plInboundDate)} →{' '}
                    {formatMonthDay(delay.expected3plInboundDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">+{delay.delayDays}일</TableCell>
                  <TableCell>
                    {delay.atRiskOrderCount === null ? '-' : `${delay.atRiskOrderCount}건`}
                  </TableCell>
                  <TableCell>
                    {delay.status ? (
                      <Badge variant={DELAY_STATUS_BADGE_VARIANT[delay.status]}>
                        {DELAY_STATUS_LABEL[delay.status]}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
