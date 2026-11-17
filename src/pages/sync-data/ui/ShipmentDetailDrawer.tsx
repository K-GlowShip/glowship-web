import { useQuery } from '@tanstack/react-query'
import { useId } from 'react'

import { getRegionLabel, TRANSPORT_MODE_LABEL } from '@/entities/delay-event'
import { type Shipment, shipmentQueries } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  getShipmentStageLabel,
  isShipmentNotFound,
  isTransportModeInStageLabel,
} from '../model/shipment-detail'
import { getShipmentDelayStatusLabel, SHIPMENT_STAGE_BADGE_VARIANT } from '../model/shipments'
import { ShipmentHistorySection } from './ShipmentHistorySection'
import { ShipmentLinesSection } from './ShipmentLinesSection'
import { ShipmentScheduleSection } from './ShipmentScheduleSection'

interface ShipmentDetailDrawerProps {
  shipment: Shipment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}

/**
 * 선적 상세 서랍(SCR-005 선적 탭). 머리는 목록 행으로 바로 그리고(두 줄로 짧게),
 * 본문은 일정 → 일정 변경 이력 → 상품 순서로 상세 API에서 받는다. 데이터 기준 시각은 아래에 고정이다.
 */
export function ShipmentDetailDrawer({
  shipment,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: ShipmentDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined} onCloseAutoFocus={onCloseAutoFocus}>
        {shipment && <ShipmentDetailContent shipment={shipment} />}
      </DrawerContent>
    </Drawer>
  )
}

function ShipmentDetailContent({ shipment }: { shipment: Shipment }) {
  const {
    data: detail,
    error,
    isFetching,
    refetch,
  } = useQuery(shipmentQueries.detail(shipment.shipmentId))
  const id = useId()

  return (
    <>
      <DrawerHeader className="py-14pxr">
        <div className="flex flex-wrap items-center gap-x-10pxr gap-y-4pxr">
          <DrawerTitle>{shipment.shipmentCode}</DrawerTitle>
          <Badge variant={SHIPMENT_STAGE_BADGE_VARIANT[shipment.stage]}>
            {getShipmentStageLabel(shipment.stage, shipment.transportMode)}
          </Badge>
          <Badge variant={shipment.isDelayed ? 'danger' : 'success'}>
            {getShipmentDelayStatusLabel(shipment)}
          </Badge>
        </div>
        <p className="mt-2pxr text-b2 text-muted-foreground">
          {/* 단계 배지가 이미 "해상 운송"·"항공 운송"이라고 말할 때는 운송 수단을 다시 적지 않는다 */}
          {!isTransportModeInStageLabel(shipment.stage) &&
            `${TRANSPORT_MODE_LABEL[shipment.transportMode]} · `}
          {shipment.route} · {shipment.warehouse.warehouseCode}{' '}
          {getRegionLabel(shipment.warehouse.regionCode)}
        </p>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-28pxr px-24pxr py-20pxr">
        {detail ? (
          <>
            <ShipmentScheduleSection detail={detail} />
            <ShipmentHistorySection
              history={detail.scheduleHistory}
              transportMode={detail.transportMode}
              tableId={`${id}-history`}
            />
            <ShipmentLinesSection lines={detail.lines} tableId={`${id}-lines`} />
          </>
        ) : error ? (
          isShipmentNotFound(error) ? (
            <p role="alert" className="py-48pxr text-center text-b1 text-muted-foreground">
              지금은 조회할 수 없는 선적입니다.
              <span className="block text-b2">목록을 다시 조회한 뒤 선택해 주세요.</span>
            </p>
          ) : (
            <QueryError
              message={error.message}
              loading={isFetching}
              onRetry={() => void refetch()}
            />
          )
        ) : (
          <DetailSkeleton />
        )}
      </DrawerBody>

      <DrawerFooter className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-2pxr py-12pxr">
        {/* 로딩 중에는 스켈레톤(div)이 들어가므로 p가 아니라 div다 */}
        <div>
          데이터 기준 시각{' '}
          {detail ? (
            <span className="ml-4pxr text-b2 font-medium text-foreground tabular-nums">
              <time dateTime={detail.dataBasisAt}>{formatYYYYMMDDHHmm(detail.dataBasisAt)}</time>{' '}
              KST
            </span>
          ) : error ? (
            <span className="ml-4pxr text-b2 text-foreground">{EMPTY_VALUE}</span>
          ) : (
            <Skeleton className="ml-4pxr inline-block h-14pxr w-130pxr align-middle" />
          )}
        </div>
        <p>이 선적을 마지막으로 바꾼 수집이 끝난 시각</p>
      </DrawerFooter>
    </>
  )
}

/** 본문과 같은 자리(일정 표, 이력 표, 상품 표)를 비워 둔다 */
function DetailSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-12pxr">
        <Skeleton className="h-20pxr w-40pxr" />
        <Skeleton className="h-190pxr rounded-card" />
        <Skeleton className="h-14pxr w-3/5" />
      </div>
      <div className="flex flex-col gap-12pxr">
        <Skeleton className="h-20pxr w-100pxr" />
        <Skeleton className="h-230pxr rounded-card" />
      </div>
      <div className="flex flex-col gap-12pxr">
        <Skeleton className="h-20pxr w-40pxr" />
        <Skeleton className="h-230pxr rounded-card" />
      </div>
    </>
  )
}
