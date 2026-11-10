import { useQuery } from '@tanstack/react-query'
import { ChevronRight, CircleCheck } from 'lucide-react'
import { Link } from 'react-router'

import {
  DELAY_COUNT_KEY,
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
} from '@/entities/delay-event'
import { delayEventQueries } from '@/shared/api'
import { EMPTY_VALUE, ROUTES, delayCenterListPath } from '@/shared/config'
import { formatNumber } from '@/shared/lib/format-number'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import { DELAY_PREVIEW_SIZE, DELAY_STATUS_ORDER } from '../model/dashboard'
import { DelayVoyageRow } from './DelayVoyageRow'

export function DelayVoyageCard() {
  // 최종 선택 전인 지연 중 최근 감지된 건. 상태별 건수(`counts`)는 같은 응답에 들어 있다
  const { data, error, isFetching, refetch } = useQuery(
    delayEventQueries.list({ hasFinalDecision: false, size: DELAY_PREVIEW_SIZE }),
  )
  const counts = data?.counts

  return (
    // 맨 아래 줄의 호버 배경이 카드의 둥근 모서리를 넘지 않게 잘라 낸다
    <Card className="overflow-hidden border-primary-100">
      <CardHeader>
        <div className="flex items-center gap-12pxr">
          <CardTitle as="h2">대응이 필요한 지연</CardTitle>
          <p className="text-caption text-muted-foreground">최근 {DELAY_PREVIEW_SIZE}건만 표시</p>
        </div>
        <Link to={ROUTES.DELAY_CENTER} className="text-b2 text-primary hover:underline">
          지연 대응 센터에서 보기 →
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-16pxr px-0 pt-16pxr pb-0">
        <ul
          aria-label="상태별 지연 건수, 누르면 해당 상태 목록으로 이동"
          className="grid grid-cols-2 gap-16pxr px-24pxr lg:grid-cols-4"
        >
          {DELAY_STATUS_ORDER.map((status) => (
            <li key={status}>
              <Link
                to={delayCenterListPath(status)}
                className="group flex items-center justify-between gap-8pxr rounded-card border border-transparent bg-primary-50 px-16pxr py-12pxr transition-colors outline-none hover:border-primary-200 focus-visible:ring-[3px] focus-visible:ring-primary/30"
              >
                <Badge variant={DELAY_STATUS_BADGE_VARIANT[status]}>
                  {DELAY_STATUS_LABEL[status]}
                </Badge>
                <span className="flex items-center gap-4pxr">
                  <span className="text-h3 font-bold tabular-nums">
                    {counts ? `${formatNumber(counts[DELAY_COUNT_KEY[status]])}건` : EMPTY_VALUE}
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

        {!data ? (
          error ? (
            <QueryError
              message={error.message}
              loading={isFetching}
              onRetry={() => void refetch()}
            />
          ) : (
            <div className="flex flex-col gap-8pxr px-24pxr pb-24pxr">
              {Array.from({ length: DELAY_PREVIEW_SIZE }, (_, index) => (
                <Skeleton key={index} className="h-72pxr" />
              ))}
            </div>
          )
        ) : data.items.length === 0 ? (
          <p className="flex flex-col items-center gap-8pxr py-48pxr text-muted-foreground">
            <CircleCheck className="size-24pxr text-success" aria-hidden="true" />
            대응이 필요한 지연이 없습니다.
          </p>
        ) : (
          <ul aria-label="대응이 필요한 지연 선적" className="divide-y divide-border border-t">
            {data.items.map((delay) => (
              <DelayVoyageRow key={delay.delayEventId} delay={delay} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
