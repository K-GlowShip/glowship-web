import { useQuery } from '@tanstack/react-query'

import { dashboardQueries, delayEventQueries, shipmentQueries, TRANSPORT_MODE } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Skeleton } from '@/shared/ui/skeleton'

import { HERO_MOOD, toHeroCopy, type HeroMood } from '../model/hero-copy'
import { isFullyFetched, ROUTE_MAP_FETCH_SIZE, toTransportSummaries } from '../model/hero-route'
import { HeroDateline, HeroHeadline } from './HeroHeadline'
import { RouteMap } from './RouteMap'

/** 강조 글자 색. 지연 건수는 지도의 지연 점과 같은 붉은색, '순조로워요'는 보라 */
const HIGHLIGHT_CLASS: Record<HeroMood, string> = {
  [HERO_MOOD.DELAYED]: 'text-danger',
  [HERO_MOOD.CLEAR]: 'text-primary',
}

/** 범례 앞의 작은 점(HTML이라 배경색으로). 지도의 호 색과 같은 약속: 해상은 파랑, 항공은 보라 */
const LEGEND_DOT_CLASS: Record<string, string> = {
  [TRANSPORT_MODE.OCEAN]: 'bg-info',
  [TRANSPORT_MODE.AIR]: 'bg-primary',
}
const UNKNOWN_LEGEND_DOT_CLASS = 'bg-primary'

/**
 * 요약의 본문: 기준 날짜, 오늘 상황 한 문장, 뒤(또는 아래)의 정적 항로 지도, 그리고 실제 데이터인
 * 운송 수단별 건수 범례(진행 중 선적 수 + 확인이 필요한 지연 수). 바탕 면은 쓰는 쪽(DashboardHero)이 두른다
 */
export function HeroRouteContent() {
  // 지표와 같은 요약 query다. 같은 키라서 요청은 한 번만 나간다
  const { data: summary, error } = useQuery(dashboardQueries.summary())
  // 범례 건수를 셀 선적. 입고 전 선적만 세고, 서버가 한 번에 주는 최대 수만 받는다
  const { data: shipments } = useQuery(shipmentQueries.list({ size: ROUTE_MAP_FETCH_SIZE }))
  // 확인이 필요한 지연 수. 헤드라인(요약)과 같은 기준으로 세려고 지연 이벤트 목록에서 직접 센다.
  // 아직 없거나 실패하면 그 부분만 비우고 나머지 범례는 그대로 보인다
  const { data: delayEvents } = useQuery(delayEventQueries.list({ size: ROUTE_MAP_FETCH_SIZE }))
  const copy = summary ? toHeroCopy(summary) : null
  // 한 페이지에 다 담기지 않으면 건수가 틀리므로 선적이 넘치면 범례를 비우고, 이벤트가 넘치면 확인 필요 건수만 비운다
  const summaries =
    shipments && isFullyFetched(shipments)
      ? toTransportSummaries(
          shipments.items,
          delayEvents && isFullyFetched(delayEvents) ? delayEvents.items : null,
        )
      : null

  return (
    <div className="relative flex min-h-320pxr flex-col justify-between gap-24pxr p-32pxr">
      <div className="flex max-w-560pxr flex-col gap-16pxr">
        <HeroDateline lastSyncedAt={summary?.lastSyncedAt ?? null} className="text-primary" />
        {copy ? (
          <HeroHeadline
            copy={copy}
            className="text-hero text-foreground"
            highlightClassName={HIGHLIGHT_CLASS[copy.mood]}
          />
        ) : error ? (
          <h1 className="text-hero font-light break-keep text-muted-foreground">
            지금은 오늘의 요약을
            <br />
            불러올 수 없어요
          </h1>
        ) : (
          <Skeleton className="h-120pxr w-4/5 bg-primary-100" aria-busy="true" />
        )}
      </div>

      {/*
       * 요약이 넓으면(컨테이너 기준) 지도가 글 뒤의 배경이 되고, 좁으면 글 아래에 따로 놓인다.
       * 배경일 때는 왼쪽 120px을 비워 두어, 요약이 그리 넓지 않을 때 한국 항구와 호의 출발부가 커진 한 문장 카피
       * 밑으로 들어가지 않게 한다(넓으면 지도가 오른쪽에 맞춰져 이 여백은 영향이 없다)
       */}
      <div className="@3xl:absolute @3xl:inset-y-0 @3xl:right-0 @3xl:left-120pxr @3xl:-z-10">
        <RouteMap className="h-auto w-full @3xl:h-full" />
      </div>

      {/* 실제 데이터: 운송 수단별 진행 중 건수와 확인이 필요한 지연 건수. 지도와 같은 대표 항로를 작게 덧붙인다 */}
      {summaries && summaries.length > 0 && (
        <ul
          aria-label="운송 수단별 진행 중인 선적"
          className="flex flex-wrap gap-x-24pxr gap-y-8pxr"
        >
          {summaries.map((item) => (
            <li key={item.transportMode} className="flex items-center gap-8pxr text-b2">
              <span
                className={cn(
                  'size-8pxr rounded-full',
                  LEGEND_DOT_CLASS[item.transportMode] ?? UNKNOWN_LEGEND_DOT_CLASS,
                )}
                aria-hidden="true"
              />
              <span className="font-bold">{item.label}</span>
              <span className="text-muted-foreground">
                {formatNumber(item.count)}건
                {item.needsReviewCount !== null && item.needsReviewCount > 0 && (
                  <>
                    {' · '}
                    <span className="font-bold text-danger">
                      확인 필요 {formatNumber(item.needsReviewCount)}건
                    </span>
                  </>
                )}
              </span>
              {item.route && (
                <span className="text-caption text-muted-foreground">{item.route}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
