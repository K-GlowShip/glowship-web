import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { getRoleLabel } from '@/entities/session'
import { analysisRunQueries, type Decision } from '@/shared/api'
import { delayCenterPath, EMPTY_VALUE } from '@/shared/config'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
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
        <div className="flex flex-wrap items-end gap-x-12pxr gap-y-4pxr">
          {/* 라벨도 제목 안에 두어, 스크린 리더가 "대응안 현재 계획 유지"로 함께 읽게 한다(지연 상세 머리와 같은 방식) */}
          <DrawerTitle className="text-display font-bold">
            <span className="block text-caption font-normal text-muted-foreground">대응안</span>
            {getDecisionOptionLabel(decision)}
          </DrawerTitle>
          <Badge variant={HISTORY_STATUS_BADGE_VARIANT[decision.status]} className="mb-10pxr">
            {HISTORY_STATUS_LABEL[decision.status]}
          </Badge>
        </div>
        <DrawerDescription className="mt-4pxr">
          {getDecisionTargetLabel(decision)}
        </DrawerDescription>
        <dl className="mt-20pxr grid grid-cols-[1.4fr_1fr_1fr] gap-16pxr border-t border-primary-900/10 pt-16pxr">
          <Meta label="선택자">
            {decision.decidedBy.displayName}
            <span className="block text-caption text-muted-foreground">
              {getRoleLabel(decision.decidedBy.roleCode)}
            </span>
          </Meta>
          <Meta label="선택 일시">{formatYYYYMMDDHHmm(decision.decidedAt)}</Meta>
          <Meta label="실행 ID">{decision.run.runCode ?? EMPTY_VALUE}</Meta>
        </dl>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-32pxr px-24pxr py-32pxr">
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
          className="group inline-flex items-center gap-4pxr self-start text-b1 font-medium text-primary outline-none hover:underline focus-visible:underline"
        >
          지연 건 상세 보기
          <ArrowRight
            className="size-16pxr transition-transform group-hover:translate-x-2pxr motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </DrawerBody>

      <DrawerFooter>{HISTORY_DISCLAIMER}</DrawerFooter>
    </>
  )
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="mt-2pxr text-b2 font-medium wrap-break-word">{children}</dd>
    </div>
  )
}
