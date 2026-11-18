import type { ReactNode } from 'react'

import { getRegionLabel } from '@/entities/delay-event'
import type { ShipmentDetail } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { InfoTip } from '@/shared/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import {
  formatSignedDays,
  getArrivalLegLabel,
  getLeadtimeConfidenceLabel,
} from '../model/shipment-detail'

/**
 * 일정. 여정 순서(출고 → 항구/공항 도착 → 3PL 입고)를 행으로, 계획·예상·실제를 열로 둔 표 하나다.
 * 항구(항공은 공항) 도착과 3PL 입고는 다른 날짜라서(BR-007) 행을 나누고 장소(도착지·창고)를 함께 적는다.
 * 지연 일수는 서랍에서 이곳 한 곳에만, 3PL 입고의 예상일(입고 뒤면 실제일) 옆에 붙여 어떤 날짜가 계획보다 늦은지 바로 보이게 한다.
 * 그 아래 한 줄은 계획 3PL 입고일을 정한 시장 리드타임 기준이다.
 */
export function ShipmentScheduleSection({ detail }: { detail: ShipmentDetail }) {
  const { plannedBasis, warehouse } = detail
  const delayLabel = detail.isDelayed ? formatSignedDays(detail.delayDays) : null
  // 입고 전에는 예상일이, 입고 뒤에는 실제일이 계획과 비교된 날짜다
  const isReceived = detail.actual3plInboundDate !== null
  // 계획 3PL 입고일을 정한 근거(미국 수입 통계의 총 소요 기간). 계획일 옆 ⓘ에 담는다. P50은 참고값이라 반올림하고, P90은 서버가 계획일에 더한 값과 같게 올림한다(계획 입고일 = 출고일 + 올림(P90))
  const basisTip = [
    `계획 3PL 입고일 근거 · ${plannedBasis.month} 미국 수입 통계`,
    `보통 (P50): 약 ${formatNumber(Math.round(plannedBasis.totalLeadtimeP50))}일`,
    `대부분 이내 (P90): ${formatNumber(Math.ceil(plannedBasis.totalLeadtimeP90))}일`,
    `신뢰도: ${getLeadtimeConfidenceLabel(plannedBasis.confidenceLeadtime)}`,
  ].join('\n')

  return (
    <section className="flex flex-col gap-12pxr">
      <h3 className="text-b1 font-bold">일정</h3>
      {/* 좁은 화면에서는 날짜 열 셋을 한 줄에 담을 수 없어, 구간마다 계획·예상·실제를 세로로 쌓는다. 구분선 없이 간격으로만 나눈다 */}
      <ul className="flex flex-col gap-20pxr sm:hidden">
        <LegCard name="출고" place="한국">
          <LegDate label="계획" value={detail.plannedKrReleaseDate} />
        </LegCard>
        <LegCard name={getArrivalLegLabel(detail.transportMode)} place={plannedBasis.usPortName}>
          <LegDate label="예상" value={detail.expectedPortArrivalDate} />
        </LegCard>
        <LegCard
          name="3PL 입고"
          place={`${warehouse.warehouseCode} · ${getRegionLabel(warehouse.regionCode)}`}
        >
          <LegDate label="계획" value={detail.planned3plInboundDate} tip={basisTip} />
          <LegDate
            label="예상"
            value={detail.expected3plInboundDate}
            delayLabel={isReceived ? null : delayLabel}
          />
          <LegDate
            label="실제"
            value={detail.actual3plInboundDate}
            delayLabel={isReceived ? delayLabel : null}
          />
        </LegCard>
      </ul>
      <Table density="compact" className="hidden sm:table">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">구간</TableHead>
            <TableHead scope="col" className="w-120pxr">
              계획
            </TableHead>
            <TableHead scope="col" className="w-150pxr">
              예상
            </TableHead>
            <TableHead scope="col" className="w-150pxr">
              실제
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <LegHead name="출고" place="한국" />
            <DateCell value={detail.plannedKrReleaseDate} />
            <BlankCell />
            <BlankCell />
          </TableRow>
          <TableRow>
            <LegHead
              name={getArrivalLegLabel(detail.transportMode)}
              place={plannedBasis.usPortName}
            />
            <BlankCell />
            <DateCell value={detail.expectedPortArrivalDate} />
            <BlankCell />
          </TableRow>
          <TableRow>
            <LegHead
              name="3PL 입고"
              place={`${warehouse.warehouseCode} · ${getRegionLabel(warehouse.regionCode)}`}
            />
            <DateCell value={detail.planned3plInboundDate} tip={basisTip} />
            <DateCell
              value={detail.expected3plInboundDate}
              delayLabel={isReceived ? null : delayLabel}
            />
            <DateCell
              value={detail.actual3plInboundDate}
              delayLabel={isReceived ? delayLabel : null}
            />
          </TableRow>
        </TableBody>
      </Table>
    </section>
  )
}

/** 행의 좌우·상하 여백. 구간 칸이 두 줄이라 기본보다 조금 줄인다 */
const CELL_CLASS = 'px-12pxr py-8pxr'

/** 좁은 화면용 구간 카드. 구간 이름·장소 아래에 해당하는 날짜만 라벨과 함께 쌓는다 */
function LegCard({ name, place, children }: { name: string; place: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-8pxr">
      <p className="font-medium">
        {name}
        <span className="ml-8pxr text-caption font-normal text-muted-foreground">{place}</span>
      </p>
      <dl className="flex flex-col gap-4pxr">{children}</dl>
    </li>
  )
}

function LegDate({
  label,
  value,
  delayLabel,
  tip,
}: {
  label: string
  value: string | null
  delayLabel?: string | null
  /** 날짜 옆 ⓘ에 담을 근거 설명 */
  tip?: string
}) {
  return (
    <div className="flex items-baseline gap-12pxr">
      <dt className="w-32pxr shrink-0 text-caption text-muted-foreground">{label}</dt>
      <dd className={cn('tabular-nums', delayLabel && 'text-danger')}>
        {value ?? EMPTY_VALUE}
        {delayLabel && <span className="ml-6pxr text-caption font-bold">{delayLabel}</span>}
        {tip && <BasisTip tip={tip} />}
      </dd>
    </div>
  )
}

/** 구간 이름과 장소. 행 머리글이라 th다 */
function LegHead({ name, place }: { name: string; place: string }) {
  return (
    <th scope="row" className={cn(CELL_CLASS, 'text-left font-medium')}>
      {name}
      <span className="block text-caption font-normal text-muted-foreground">{place}</span>
    </th>
  )
}

/** 해당 없는 칸(예: 출고의 예상·실제). 비워 두어 "값이 아직 없음"(–)과 구분한다 */
function BlankCell() {
  return <TableCell className={CELL_CLASS} />
}

/** 날짜 한 칸. 값이 없으면 `EMPTY_VALUE`. 지연 일수가 있으면 날짜와 함께 위험색으로 붙인다 */
function DateCell({
  value,
  delayLabel,
  tip,
}: {
  value: string | null
  delayLabel?: string | null
  tip?: string
}) {
  return (
    <TableCell
      className={cn(CELL_CLASS, 'whitespace-nowrap tabular-nums', delayLabel && 'text-danger')}
    >
      {value ?? EMPTY_VALUE}
      {delayLabel && <span className="ml-6pxr text-caption font-bold">{delayLabel}</span>}
      {tip && <BasisTip tip={tip} />}
    </TableCell>
  )
}

/** 계획일 옆의 작은 ⓘ. 눌러서 계획 입고일의 근거를 본다 */
function BasisTip({ tip }: { tip: string }) {
  return (
    <span className="ml-6pxr inline-flex align-middle">
      <InfoTip label="계획 3PL 입고일 근거" description={tip} />
    </span>
  )
}
