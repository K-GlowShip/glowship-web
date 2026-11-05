import { useSearchParams } from 'react-router'

import { NEW_DELAY_FROM } from '@/entities/delay-event'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Card, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { TableTemplate } from '@/shared/ui/table-template'

import {
  countByStatus,
  DELAY_PAGE_SIZE,
  DELAY_STATUS_OPTIONS,
  type DelayStatusFilter,
  filterDelayCases,
  LIST_PARAM,
  parseFromParam,
  parseHasFinalDecisionParam,
  sortDelayCases,
  STATUS_FILTER_ALL,
} from '../model/delay-center'
import { DELAY_CASES } from '../model/delay-center-mock'
import { DelayListFilters } from './DelayListFilters'
import { DelayTable } from './DelayTable'

const SORTED_CASES = sortDelayCases(DELAY_CASES)

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
  // 대시보드의 새 지연 알림과 같은 조건이면 '새 지연 보기'가 켜진 상태다
  const isNewDelayView = from === NEW_DELAY_FROM && hasFinalDecision === false

  const filtered = filterDelayCases(SORTED_CASES, status, keyword, { from, hasFinalDecision })
  // 상태별 건수는 API 명세 4.4의 `counts`처럼 검색어와 `from`은 반영하고, 상태 선택과 `hasFinalDecision`은 반영하지 않는다
  const counts = countByStatus(filterDelayCases(SORTED_CASES, STATUS_FILTER_ALL, keyword, { from }))
  const pageCount = Math.max(1, Math.ceil(filtered.length / DELAY_PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(searchParams.get(LIST_PARAM.PAGE)) || 1), pageCount)
  const pageCases = filtered.slice((page - 1) * DELAY_PAGE_SIZE, page * DELAY_PAGE_SIZE)

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
        <CardContent className="flex flex-col gap-16pxr p-24pxr">
          <DelayListFilters
            keyword={keyword}
            status={status}
            counts={counts}
            onSearch={({ keyword: nextKeyword, status: nextStatus }) =>
              updateParams({
                [LIST_PARAM.KEYWORD]: nextKeyword,
                [LIST_PARAM.STATUS]: nextStatus === STATUS_FILTER_ALL ? '' : nextStatus,
              })
            }
          />
          <TableTemplate
            totalCount={filtered.length}
            Controls={
              <>
                {hasExtraCondition && (
                  <p role="status" className="text-b2 text-muted-foreground">
                    {extraConditionLabel} 건만 보고 있습니다.
                  </p>
                )}
                <Switch
                  id="new-delay-toggle"
                  checked={isNewDelayView}
                  onCheckedChange={(checked) =>
                    updateParams(
                      checked
                        ? {
                            [LIST_PARAM.FROM]: NEW_DELAY_FROM,
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
              </>
            }
            page={page}
            pageCount={pageCount}
            onPageChange={(next) =>
              updateParams({ [LIST_PARAM.PAGE]: next > 1 ? String(next) : '' }, false)
            }
          >
            <DelayTable cases={pageCases} listSearch={searchParams.toString()} />
          </TableTemplate>
        </CardContent>
      </Card>
    </div>
  )
}
