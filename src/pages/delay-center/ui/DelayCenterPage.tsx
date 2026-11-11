import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { getNewDelayFrom } from '@/entities/delay-event'
import { dashboardQueries, delayEventQueries } from '@/shared/api'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Card, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { TableTemplate } from '@/shared/ui/table-template'

import {
  DELAY_PAGE_SIZE,
  DELAY_STATUS_OPTIONS,
  type DelayStatusFilter,
  LIST_PARAM,
  parseFromParam,
  parseHasFinalDecisionParam,
  STATUS_FILTER_ALL,
} from '../model/delay-center'
import { DelaySearch, DelayStatusTabs } from './DelayListFilters'
import { DelayTable } from './DelayTable'

const isStatusFilter = (value: string): value is DelayStatusFilter =>
  value === STATUS_FILTER_ALL || (DELAY_STATUS_OPTIONS as string[]).includes(value)

/** 지연 목록 화면. 검색어·상태·페이지는 주소에 담아서 상세에서 돌아와도 그대로 유지한다. */
export function DelayCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const keyword = searchParams.get(LIST_PARAM.KEYWORD) ?? ''
  const statusParam = searchParams.get(LIST_PARAM.STATUS) ?? STATUS_FILTER_ALL
  const status = isStatusFilter(statusParam) ? statusParam : STATUS_FILTER_ALL

  // 대시보드의 새 지연 알림에서 넘어오는 조건(명세 4.4 `from`, `hasFinalDecision`)
  const from = parseFromParam(searchParams.get(LIST_PARAM.FROM))
  const hasFinalDecision = parseHasFinalDecisionParam(
    searchParams.get(LIST_PARAM.HAS_FINAL_DECISION),
  )
  const hasExtraCondition = from !== undefined || hasFinalDecision !== undefined
  const page = Math.max(1, Math.floor(Number(searchParams.get(LIST_PARAM.PAGE))) || 1)

  // '새 지연 보기'의 기준은 대시보드와 같이 마지막 수집 시각에서 계산한다. 수집된 데이터가 없으면 켤 수 없다
  const { data: summary } = useQuery(dashboardQueries.summary())

  const newDelayFrom = summary?.lastSyncedAt ? getNewDelayFrom(summary.lastSyncedAt) : undefined
  const isNewDelayView =
    newDelayFrom !== undefined && from === newDelayFrom && hasFinalDecision === false

  const query = useQuery(
    delayEventQueries.list({
      status: status === STATUS_FILTER_ALL ? undefined : status,
      q: keyword || undefined,
      from,
      hasFinalDecision,
      page,
      size: DELAY_PAGE_SIZE,
    }),
  )
  const { data } = query

  /** 값이 빈 문자열이면 주소에서 지운다. 조건이 바뀌면 1페이지로 돌아간다. */
  const updateParams = (changes: Partial<Record<string, string>>, resetPage = true) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(changes)) {
          if (value) {
            next.set(key, value)
          } else {
            next.delete(key)
          }
        }
        if (resetPage) {
          next.delete(LIST_PARAM.PAGE)
        }
        return next
      },
      { replace: true },
    )
  }

  const extraConditionLabel = [
    from !== undefined && `${formatYYYYMMDDHHmm(from)} 이후 감지`,
    hasFinalDecision === false && '최종 선택 전',
    hasFinalDecision === true && '최종 선택 완료',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">지연 대응 센터</h1>
        <p className="text-b1 text-muted-foreground">
          지연 영향을 확인하고, 근거를 비교해 최선의 대응안을 선택하세요.
        </p>
      </header>

      <Card className="rounded-panel">
        <CardContent className="flex flex-col gap-16pxr px-24pxr pt-12pxr pb-24pxr">
          <DelayStatusTabs
            status={status}
            counts={data?.counts}
            onChange={(next) =>
              updateParams({ [LIST_PARAM.STATUS]: next === STATUS_FILTER_ALL ? '' : next })
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-x-16pxr gap-y-8pxr">
            <DelaySearch
              keyword={keyword}
              onSearch={(next) => updateParams({ [LIST_PARAM.KEYWORD]: next })}
            />
            <div className="flex items-center gap-8pxr">
              <Switch
                id="new-delay-toggle"
                checked={isNewDelayView}
                disabled={newDelayFrom === undefined}
                onCheckedChange={(checked) =>
                  updateParams(
                    checked
                      ? {
                          [LIST_PARAM.FROM]: newDelayFrom ?? '',
                          [LIST_PARAM.HAS_FINAL_DECISION]: 'false',
                        }
                      : { [LIST_PARAM.FROM]: '', [LIST_PARAM.HAS_FINAL_DECISION]: '' },
                  )
                }
              />
              <Label
                htmlFor="new-delay-toggle"
                className={isNewDelayView ? 'text-primary' : 'font-normal'}
              >
                새 지연 보기
              </Label>
            </div>
          </div>
          {hasExtraCondition && (
            <p role="status" className="text-b2 text-muted-foreground">
              {extraConditionLabel} 건만 보고 있습니다.
            </p>
          )}
          <TableTemplate
            totalCount={data?.totalCount}
            page={page}
            pageCount={Math.max(1, data?.totalPages ?? 1)}
            onPageChange={(next) =>
              updateParams({ [LIST_PARAM.PAGE]: next > 1 ? String(next) : '' }, false)
            }
          >
            <DelayTable query={query} listSearch={searchParams.toString()} />
          </TableTemplate>
        </CardContent>
      </Card>
    </div>
  )
}
