import { RefreshCw } from 'lucide-react'

import { TRANSPORT_MODE_LABEL } from '@/entities/delay-event'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD, formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

import {
  canReanalyze,
  countRiskOrdersByAttribution,
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  type DelayCase,
  formatRoute,
  getIncreasedShortage,
  RESULT_CLASS_BADGE_VARIANT,
  REANALYSIS_ENABLED,
  RESULT_CLASS_LABEL,
  SKU_SCOPE,
} from '../model/delay-center'
import { useReanalysis } from '../model/use-reanalysis'
import { AnalysisInfo } from './AnalysisInfo'

interface DelayDetailHeaderProps {
  delayCase: DelayCase
}

/**
 * 지연 상세의 머리. 어떤 선적인지(선적 번호·상태·경로)와 이 지연의 크기(지연 일수·예상 입고·부족 수량·위험 주문)를
 * 상자 없이 큰 숫자로 먼저 보여 준다. 자세한 근거는 아래 영역에 있다.
 * 한 선적에 상품이 여럿일 수 있어 대표 상품은 적지 않는다.
 */
export function DelayDetailHeader({ delayCase }: DelayDetailHeaderProps) {
  const { mutate: reanalyze, isPending: isReanalyzing } = useReanalysis()
  const { analysis, delayDays, plannedInbound, expectedInbound } = delayCase
  const impactedCount =
    analysis?.impacts.filter(({ scope }) => scope === SKU_SCOPE.IMPACTED).length ?? 0

  return (
    <header className="flex flex-col gap-20pxr px-16pxr">
      <div className="flex items-start justify-between gap-16pxr">
        <div className="flex flex-col gap-4pxr">
          <div className="flex flex-wrap items-end gap-x-12pxr gap-y-4pxr">
            {/* 라벨도 제목 안에 두어, 스크린 리더가 "선적 번호 OCN-…"으로 함께 읽게 한다 */}
            <h2 className="text-display font-bold">
              <span className="block text-caption font-normal text-muted-foreground">
                선적 번호
              </span>
              {delayCase.shipmentCode}
            </h2>
            <div className="flex items-center gap-8pxr pb-8pxr">
              <Badge variant={DELAY_STATUS_BADGE_VARIANT[delayCase.status]}>
                {DELAY_STATUS_LABEL[delayCase.status]}
              </Badge>
              {analysis && (
                <Badge variant={RESULT_CLASS_BADGE_VARIANT[analysis.resultClass]} dot={false}>
                  {RESULT_CLASS_LABEL[analysis.resultClass]}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-b2 text-muted-foreground">
            {[
              formatRoute(delayCase),
              TRANSPORT_MODE_LABEL[delayCase.transportMode],
              `${formatYYYYMMDDHHmm(delayCase.detectedAt)} 감지`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {REANALYSIS_ENABLED && canReanalyze(delayCase) && (
          <Button
            variant="secondary"
            aria-busy={isReanalyzing || undefined}
            onClick={() => !isReanalyzing && reanalyze()}
          >
            <RefreshCw className={cn(isReanalyzing && 'animate-spin')} aria-hidden="true" />
            재분석
          </Button>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-y-20pxr border-y border-primary-900/10 py-20pxr lg:grid-cols-4">
        <Figure
          label="지연"
          value={delayDays > 0 ? `+${delayDays}` : '0'}
          unit="일"
          isAlert={delayDays > 0}
          caption={`계획 입고 ${formatMMDD(plannedInbound)}`}
        />
        <Figure
          label="예상 입고"
          value={formatMMDD(expectedInbound)}
          caption={delayDays > 0 ? `계획보다 ${delayDays}일 늦음` : '계획대로 입고'}
        />
        <Figure
          label="부족 수량"
          value={analysis ? formatNumber(getIncreasedShortage(analysis.impacts)) : EMPTY_VALUE}
          unit={analysis ? '개' : undefined}
          caption={
            analysis ? `지연으로 늘어난 부족 · 상품 ${impactedCount}개` : '분석 결과가 없습니다'
          }
        />
        <Figure
          label="위험 주문"
          value={
            analysis
              ? formatNumber(countRiskOrdersByAttribution(analysis.riskOrders).delayInduced)
              : EMPTY_VALUE
          }
          unit={analysis ? '건' : undefined}
          caption={analysis ? '지연 때문에 납기가 위험한 주문' : '분석 결과가 없습니다'}
        />
      </dl>

      <AnalysisInfo delayCase={delayCase} />
    </header>
  )
}

interface FigureProps {
  label: string
  value: string
  unit?: string
  caption: string
  /** 눈에 띄어야 하는 값. 이 화면에서는 지연 일수에만 쓴다 */
  isAlert?: boolean
}

/** 큰 숫자 하나. 숫자는 가늘고 크게, 단위는 숫자 어깨에 작게 올린다 */
function Figure({ label, value, unit, caption, isAlert }: FigureProps) {
  return (
    <div className="flex flex-col gap-2pxr lg:border-l lg:border-primary-900/10 lg:pl-24pxr lg:first:border-l-0 lg:first:pl-0">
      <dt className="text-b2 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'flex items-start text-display font-light tracking-[-0.02em] tabular-nums',
          isAlert && 'text-danger',
        )}
      >
        {value}
        {unit && <span className="pt-[0.25em] pl-2pxr text-b1 font-normal">{unit}</span>}
      </dd>
      <dd className="text-caption text-muted-foreground">{caption}</dd>
    </div>
  )
}
