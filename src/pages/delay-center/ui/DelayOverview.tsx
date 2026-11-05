import { cn } from '@/shared/lib/cn'

import { type DelayCase, formatRoute, getVisibleImpacts } from '../model/delay-center'
import { ImpactAxis } from './ImpactAxis'
import { StageTimeline } from './StageTimeline'

interface DelayOverviewProps {
  delayCase: DelayCase
}

/**
 * 지연 개요. 선적의 경로·현재 운송 단계와, 상품별 재고·입고 일정을 한 카드에 모아서
 * "배가 지금 어디에 있고, 상품마다 재고는 언제 바닥나며, 입고는 언제인가"를 한 번에 본다.
 * 경로와 단계 표시줄은 지도로 바꿀 자리다. 지도에는 출발·도착 좌표와 단계별 일정이 필요한데 API 명세에 아직 없다.
 */
export function DelayOverview({ delayCase }: DelayOverviewProps) {
  const { route, transportMode, delayDays, plannedInbound, expectedInbound, analysis } = delayCase
  // 가장 먼저 문제가 생기는 순서의 상품들. 분석 결과가 없으면 비어 있다.
  const impacts = analysis ? getVisibleImpacts(analysis.impacts) : []

  return (
    <section
      aria-labelledby="overview-title"
      className="flex flex-col gap-20pxr rounded-card bg-background p-24pxr"
    >
      <div className="flex items-baseline justify-between gap-16pxr">
        <h3 id="overview-title" className="text-b1 font-bold">
          {formatRoute({ route, transportMode })}
        </h3>
        <p
          className={cn(
            'text-b1 font-bold',
            delayDays > 0 ? 'text-danger' : 'text-muted-foreground',
          )}
        >
          {delayDays > 0 ? `${delayDays}일 지연` : '지연 없음'}
        </p>
      </div>

      <StageTimeline delayCase={delayCase} />

      {impacts.length > 0 && (
        <div className="flex flex-col gap-16pxr border-t border-border pt-20pxr">
          <div className="flex flex-wrap items-baseline gap-x-8pxr gap-y-2pxr">
            <h4 className="text-b1 font-bold">재고 · 입고 일정</h4>
            <p className="text-b2 text-muted-foreground">가장 먼저 문제가 생기는 상품 순서입니다</p>
          </div>
          <ImpactAxis
            impacts={impacts}
            plannedInbound={plannedInbound}
            expectedInbound={expectedInbound}
          />
        </div>
      )}
    </section>
  )
}
