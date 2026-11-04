import { cn } from '@/shared/lib/cn'

import {
  type DelayCase,
  formatMonthDay,
  formatRoute,
  getVisibleImpacts,
  STAGE_FLOW,
  STAGE_LABEL,
} from '../model/delay-center'
import { ImpactAxis } from './ImpactAxis'
import { TimelineTrack } from './TimelineTrack'

interface DelayOverviewProps {
  delayCase: DelayCase
}

/**
 * 지연 개요. 선적의 경로·현재 운송 단계와, 상품별 재고·입고 일정을 한 카드에 모아서
 * "배가 지금 어디에 있고, 상품마다 재고는 언제 바닥나며, 입고는 언제인가"를 한 번에 본다.
 * 경로와 단계 표시줄은 지도로 바꿀 자리다. 지도에는 출발·도착 좌표와 단계별 일정이 필요한데 API 명세에 아직 없다.
 */
export function DelayOverview({ delayCase }: DelayOverviewProps) {
  const { route, transportMode, stage, delayDays, plannedInbound, expectedInbound, analysis } =
    delayCase
  const flow = STAGE_FLOW[transportMode]
  const currentIndex = flow.indexOf(stage)
  const lastIndex = flow.length - 1
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

      {/* 마지막 칸은 내용 너비만큼만 차지하고 오른쪽 끝에 붙여, 입고 완료 점이 아래 날짜 축의 끝과 맞는다 */}
      <ol className="grid grid-cols-[1fr_1fr_1fr_auto]">
        {flow.map((code, index) => (
          <li
            key={code}
            aria-current={index === currentIndex ? 'step' : undefined}
            className="flex flex-col gap-10pxr"
          >
            <TimelineTrack
              dotClassName={getStepDotClass(index, currentIndex)}
              lineClassName={getStepLineClass(
                index === lastIndex ? index - 1 : index,
                currentIndex,
              )}
              alignEnd={index === lastIndex}
            />
            <div className={cn('flex flex-col pr-8pxr', index === lastIndex && 'items-end pr-0')}>
              <span
                className={cn(
                  'text-b2',
                  index === currentIndex ? 'font-bold text-primary' : 'text-muted-foreground',
                )}
              >
                {STAGE_LABEL[code]}
              </span>
              {index === currentIndex && index !== lastIndex && (
                <span className="text-caption text-primary">현재</span>
              )}
              {index === lastIndex && (
                <span className="flex flex-wrap items-center justify-end gap-x-6pxr text-caption">
                  {plannedInbound !== expectedInbound && (
                    <>
                      <span className="text-muted-foreground line-through">
                        {formatMonthDay(plannedInbound)}
                      </span>
                      <span aria-hidden="true" className="text-muted-foreground">
                        →
                      </span>
                    </>
                  )}
                  <span
                    className={cn('font-bold', delayDays > 0 ? 'text-danger' : 'text-foreground')}
                  >
                    예상 {formatMonthDay(expectedInbound)}
                  </span>
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

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

/** 단계 index에서 다음 단계로 잇는 선. 현재 단계 앞까지만 진하게 칠한다. */
const getStepLineClass = (index: number, currentIndex: number) =>
  index < currentIndex ? 'bg-muted-foreground' : 'bg-border'

/** 지난 단계는 회색, 현재 단계만 보라색, 남은 단계는 옅은 색으로 구분한다. */
const getStepDotClass = (index: number, currentIndex: number) => {
  if (index === currentIndex) {
    return 'bg-primary'
  }
  return index < currentIndex ? 'bg-muted-foreground' : 'bg-border'
}
