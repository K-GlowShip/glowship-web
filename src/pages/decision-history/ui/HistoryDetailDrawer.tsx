import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import { analysisRunQueries, type Decision } from '@/shared/api'
import { delayCenterPath } from '@/shared/config'
import { Badge } from '@/shared/ui/badge'
import { buttonVariants } from '@/shared/ui/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'
import { QueryError } from '@/shared/ui/query-error'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  HISTORY_DISCLAIMER,
  HISTORY_STATUS_BADGE_VARIANT,
  HISTORY_STATUS_LABEL,
} from '../model/history'
import { getDecisionOptionLabel, getDecisionTargetLabel } from '../model/history-display'
import { HistoryAnalysisSection } from './HistoryAnalysisSection'
import { HistoryTimeline } from './HistoryTimeline'

interface HistoryDetailDrawerProps {
  decision: Decision | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}

export function HistoryDetailDrawer({
  decision,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: HistoryDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent onCloseAutoFocus={onCloseAutoFocus}>
        {decision && <HistoryDetail decision={decision} />}
      </DrawerContent>
    </Drawer>
  )
}

function HistoryDetail({ decision }: { decision: Decision }) {
  // 선택 이유·의견·당시 분석 수치는 목록 응답에 없고 분석 실행 상세에 있다
  const {
    data: run,
    error,
    isFetching,
    refetch,
  } = useQuery(analysisRunQueries.detail(decision.run.runId))

  return (
    <>
      <DrawerHeader className="bg-linear-to-br from-primary-50 via-card to-rose-50">
        <Badge variant={HISTORY_STATUS_BADGE_VARIANT[decision.status]}>
          {HISTORY_STATUS_LABEL[decision.status]}
        </Badge>
        <DrawerTitle className="mt-8pxr text-h2">{getDecisionOptionLabel(decision)}</DrawerTitle>
        <DrawerDescription>{getDecisionTargetLabel(decision)}</DrawerDescription>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-24pxr">
        {run ? (
          <>
            <HistoryTimeline decision={decision} run={run} />
            <HistoryAnalysisSection
              run={run}
              selectedOptionType={decision.responseOption?.optionType ?? null}
            />
          </>
        ) : error ? (
          <QueryError message={error.message} loading={isFetching} onRetry={() => void refetch()} />
        ) : (
          <>
            <Skeleton className="h-120pxr rounded-card" />
            <Skeleton className="h-200pxr rounded-card" />
          </>
        )}

        <Link
          to={delayCenterPath(decision.delayEventId)}
          className={buttonVariants({ variant: 'secondary', className: 'self-start' })}
        >
          지연 건 상세 보기
        </Link>
      </DrawerBody>

      <DrawerFooter>{HISTORY_DISCLAIMER}</DrawerFooter>
    </>
  )
}
