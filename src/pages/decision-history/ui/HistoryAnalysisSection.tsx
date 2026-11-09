import { PackageX, ShoppingCart, Sparkles, TriangleAlert } from 'lucide-react'
import { Fragment } from 'react'

import {
  getFeasibilityBadgeVariant,
  getFeasibilityLabel,
  getOptionTypeLabel,
  getReasonLabel,
} from '@/entities/delay-event'
import type { AnalysisRunDetail } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import { formatExplanationText, getShortageTotal } from '../model/history'

/** 당시 분석 요약: 실행 ID, 부족 수량·위험 주문 수, AI 설명, 경고. 분석 버전·기준 데이터 시각은 판단 기록에서 보여 준다 */
interface HistoryAnalysisSectionProps {
  run: AnalysisRunDetail
  /** 이 이력이 고른 대응안 유형. 의견만 쓴 초안이면 null */
  selectedOptionType: string | null
}

export function HistoryAnalysisSection({ run, selectedOptionType }: HistoryAnalysisSectionProps) {
  const { explanation } = run

  return (
    <section className="flex flex-col gap-20pxr border-t border-border pt-24pxr">
      <div>
        <h3 className="text-h3 font-bold">당시 분석 요약</h3>
        <p className="mt-4pxr text-caption text-muted-foreground">
          실행 ID {run.runCode ?? EMPTY_VALUE}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-16pxr">
        <div className="flex items-center gap-12pxr rounded-card bg-primary-50 p-16pxr">
          <span
            className="grid size-40pxr shrink-0 place-items-center rounded-full bg-primary-100 text-primary"
            aria-hidden="true"
          >
            <PackageX className="size-20pxr" />
          </span>
          <div>
            <dt className="text-caption text-muted-foreground">부족 수량</dt>
            <dd className="text-h2 font-bold">{formatNumber(getShortageTotal(run))}개</dd>
          </div>
        </div>
        <div className="flex items-center gap-12pxr rounded-card bg-danger-bg p-16pxr">
          <span
            className="grid size-40pxr shrink-0 place-items-center rounded-full bg-card/70 text-danger"
            aria-hidden="true"
          >
            <ShoppingCart className="size-20pxr" />
          </span>
          <div>
            <dt className="text-caption text-muted-foreground">위험 주문</dt>
            <dd className="text-h2 font-bold text-danger">
              {formatNumber(run.atRiskOrders.length)}건
            </dd>
          </div>
        </div>
      </dl>
      {run.responseOptions.length > 0 && (
        <div className="flex flex-col gap-12pxr">
          <h4 className="text-b1 font-bold">대응안별 결과</h4>
          <div className="overflow-x-auto">
            <Table density="compact" className="min-w-520pxr">
              <TableHeader>
                <TableRow>
                  <TableHead>대응안</TableHead>
                  <TableHead className="w-110pxr">실행 가능 여부</TableHead>
                  <TableHead className="w-90pxr">회복 주문</TableHead>
                  <TableHead className="w-90pxr">확정 감소</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {run.responseOptions.map((option) => {
                  const reason = option.reasonCode ? getReasonLabel(option.reasonCode) : null

                  return (
                    <Fragment key={option.responseOptionId}>
                      <TableRow className={cn(reason && 'border-b-0')}>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-6pxr">
                            <span className="font-bold">
                              {getOptionTypeLabel(option.optionType)}
                            </span>
                            {option.isRecommended && (
                              <Badge variant="info" dot={false}>
                                추천
                              </Badge>
                            )}
                            {option.optionType === selectedOptionType && (
                              <Badge variant="success">선택</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getFeasibilityBadgeVariant(option.feasibilityStatus)}
                            dot={false}
                          >
                            {getFeasibilityLabel(option.feasibilityStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {option.delayInducedRecoveredOrders === null
                            ? EMPTY_VALUE
                            : `${formatNumber(option.delayInducedRecoveredOrders)}건`}
                        </TableCell>
                        <TableCell>
                          {option.reductionCommittedTotal === null
                            ? EMPTY_VALUE
                            : `${formatNumber(option.reductionCommittedTotal)}개`}
                        </TableCell>
                      </TableRow>
                      {reason && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="pt-0 pb-12pxr text-b2 text-muted-foreground"
                          >
                            {reason}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-16pxr rounded-card bg-linear-to-br from-primary-50 to-rose-50 p-20pxr">
        <h4 className="flex items-center gap-8pxr text-b1 font-bold">
          <Sparkles className="size-16pxr text-primary" aria-hidden="true" />
          AI 설명
        </h4>
        {explanation ? (
          <dl className="flex flex-col gap-12pxr text-b2">
            <div>
              <dt className="font-bold">분석 요약</dt>
              <dd className="text-muted-foreground">
                {formatExplanationText(explanation.run_summary)}
              </dd>
            </div>
            <div>
              <dt className="font-bold">영향 요약</dt>
              <dd className="text-muted-foreground">
                {formatExplanationText(explanation.risk_summary)}
              </dd>
            </div>
            {explanation.recommendation_explanation && (
              <div>
                <dt className="font-bold">추천 설명</dt>
                <dd className="text-muted-foreground">
                  {formatExplanationText(explanation.recommendation_explanation)}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-b2 text-muted-foreground">{EMPTY_VALUE}</p>
        )}
      </div>
      {explanation && explanation.warnings.length > 0 && (
        <ul className="flex flex-col gap-8pxr">
          {explanation.warnings.map((warning, index) => (
            <li
              key={`${warning.code}-${index}`}
              className="flex gap-6pxr rounded-control bg-warning-bg p-12pxr text-caption text-warning"
            >
              <TriangleAlert className="mt-2pxr size-14pxr shrink-0" aria-hidden="true" />
              {warning.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
