import { ChevronDown } from 'lucide-react'

import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'

import {
  type AnalysisRunSummary,
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
} from '../model/delay-center'
import { EMPTY_TEXT } from '../model/delay-center-text'

interface RunHistoryProps {
  runs: AnalysisRunSummary[]
}

/**
 * 이 지연의 분석 버전 이력. 사람의 판단(의사결정 이력)과 다른, 시스템이 분석한 기록이다.
 * 이전 버전을 열어 보는 기능은 위치와 조회 방식을 정한 뒤에 붙인다.
 */
export function RunHistory({ runs }: RunHistoryProps) {
  if (runs.length === 0) {
    return null
  }

  return (
    <details className="group rounded-panel border border-border bg-card px-32pxr py-20pxr">
      <summary className="flex cursor-pointer list-none items-center gap-8pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 [&::-webkit-details-marker]:hidden">
        <ChevronDown
          className="size-16pxr shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
        <h3 className="text-b1 font-bold">
          분석 이력 <span className="text-muted-foreground">{runs.length}</span>
        </h3>
      </summary>
      <ol className="mt-16pxr flex flex-col gap-8pxr">
        {runs.map((run) => (
          <li
            key={run.versionNo}
            className="flex flex-wrap items-center gap-x-12pxr gap-y-4pxr rounded-card border border-border px-16pxr py-12pxr"
          >
            <span className="text-b1 font-bold">v{run.versionNo}</span>
            <span className="text-b2 text-muted-foreground">
              {run.runCode ?? EMPTY_TEXT.RUN_CODE}
            </span>
            <Badge variant={DELAY_STATUS_BADGE_VARIANT[run.status]}>
              {DELAY_STATUS_LABEL[run.status]}
            </Badge>
            {run.isLatest && (
              <Badge variant="info" dot={false}>
                최신
              </Badge>
            )}
            <span className="ml-auto text-caption text-muted-foreground">
              {formatYYYYMMDDHHmm(run.startedAt)} 시작
              {run.finishedAt && ` · ${formatYYYYMMDDHHmm(run.finishedAt)} 완료`}
            </span>
          </li>
        ))}
      </ol>
    </details>
  )
}
