import { TriangleAlert } from 'lucide-react'
import { Fragment } from 'react'

import {
  getFeasibilityBadgeVariant,
  getFeasibilityLabel,
  getOptionTypeLabel,
  getReasonLabel,
  type PlainExplanation,
} from '@/entities/delay-event'
import { type AnalysisRunDetail, isExplanationPassed } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { AiOriginalText } from '@/shared/ui/ai-original-text'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import { formatExplanationText, getShortageTotal } from '../model/history'
import { toHistoryPlain } from '../model/history-plain'

/** 당시 분석 요약: 실행 ID, 부족 수량·위험 주문 수, AI 설명, 경고. 분석 버전·기준 데이터 시각은 판단 기록에서 보여 준다 */
interface HistoryAnalysisSectionProps {
  run: AnalysisRunDetail
  /** 이 이력이 고른 대응안 유형. 의견만 쓴 초안이면 null */
  selectedOptionType: string | null
}

export function HistoryAnalysisSection({ run, selectedOptionType }: HistoryAnalysisSectionProps) {
  const { explanation } = run
  const explanationPassed = isExplanationPassed(run)
  // 지연 대응 센터와 같은 쉬운 문장. 만들 수 없으면 서버 원문을 그대로 보여 준다
  const plain = toHistoryPlain(run)
  const rows = explanation ? toExplanationRows(explanation, plain) : []
  const originals = explanation ? toOriginalItems(explanation, plain) : []

  return (
    <section className="flex flex-col gap-24pxr border-t border-border pt-32pxr">
      <h3 className="text-b1 font-bold">당시 분석 요약</h3>
      <dl className="grid grid-cols-2">
        <Figure label="부족 수량" value={formatNumber(getShortageTotal(run))} unit="개" />
        <Figure
          label="위험 주문"
          value={formatNumber(run.atRiskOrders.length)}
          unit="건"
          className="border-l border-border pl-24pxr"
        />
      </dl>
      {run.responseOptions.length > 0 && (
        <div className="flex flex-col gap-12pxr">
          <h4 className="text-b2 text-muted-foreground">대응안별 결과</h4>
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
                            {explanationPassed && option.isRecommended && (
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
      <div className="flex flex-col gap-12pxr rounded-card bg-linear-to-br from-primary-50 to-rose-50 p-20pxr">
        <h4 className="text-b1 font-bold text-primary">AI 설명</h4>
        {explanation ? (
          <>
            <dl className="flex flex-col gap-12pxr text-b2">
              {rows.map(({ label, text }) => (
                <div key={label}>
                  <dt className="font-bold">{label}</dt>
                  <dd className="text-muted-foreground">{text}</dd>
                </div>
              ))}
            </dl>
            {plain && plain.warnings.length > 0 && (
              <ul className="flex flex-col gap-8pxr">
                {plain.warnings.map((text, index) => (
                  <li
                    key={`${index}-${text}`}
                    className="flex gap-6pxr rounded-control bg-warning-bg p-12pxr text-caption text-warning"
                  >
                    <TriangleAlert className="mt-2pxr size-14pxr shrink-0" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            )}
            {plain && <AiOriginalText items={originals} />}
          </>
        ) : (
          <p className="text-b2 text-muted-foreground">{EMPTY_VALUE}</p>
        )}
      </div>
      {explanation && !plain && explanation.warnings.length > 0 && (
        <ul className="flex flex-col gap-8pxr">
          {explanation.warnings.map((warning, index) => (
            <li
              key={`${warning.code}-${index}`}
              className="flex gap-6pxr rounded-control bg-warning-bg p-12pxr text-caption text-warning"
            >
              <TriangleAlert className="mt-2pxr size-14pxr shrink-0" aria-hidden="true" />
              {/* 경고 문구에도 근거 표지([E18])가 붙어 온다. 설명 문단과 같게 지운다 */}
              {formatExplanationText(warning.text)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface FigureProps {
  label: string
  value: string
  unit: string
  className?: string
}

/** 큰 숫자 하나. 숫자는 가늘고 크게, 단위는 숫자 어깨에 작게 올린다 */
function Figure({ label, value, unit, className }: FigureProps) {
  return (
    <div className={cn('flex flex-col gap-4pxr', className)}>
      <dt className="text-b2 text-muted-foreground">{label}</dt>
      <dd className="flex items-start text-display font-light tracking-[-0.02em] tabular-nums">
        {value}
        <span className="pt-[0.25em] pl-2pxr text-b1 font-normal">{unit}</span>
      </dd>
    </div>
  )
}

type Explanation = NonNullable<AnalysisRunDetail['explanation']>

interface Row {
  label: string
  text: string
}

const toExplanationRows = (explanation: Explanation, plain: PlainExplanation | null): Row[] => {
  const candidates: [string, string | null][] = [
    ['분석 요약', plain?.runSummary ?? formatExplanationText(explanation.run_summary)],
    ['영향 요약', plain?.impactSummary ?? formatExplanationText(explanation.risk_summary)],
    [
      plain ? '추천 근거' : '추천 설명',
      plain?.recommendation ??
        (explanation.recommendation_explanation
          ? formatExplanationText(explanation.recommendation_explanation)
          : null),
    ],
  ]

  return candidates.flatMap(([label, text]) => (text ? [{ label, text }] : []))
}

/** 쉬운 문장으로 대체한 칸의 서버 원문만 접어 둔다(대체하지 않은 칸은 이미 원문이 보인다). 지연 대응 센터와 같은 규칙 */
const toOriginalItems = (explanation: Explanation, plain: PlainExplanation | null) =>
  [
    { label: '분석 요약', text: plain?.runSummary ? explanation.run_summary : null },
    { label: '영향 요약', text: plain?.impactSummary ? explanation.risk_summary : null },
    {
      label: '추천 설명',
      text: plain?.recommendation ? explanation.recommendation_explanation : null,
    },
    ...explanation.warnings.map((warning) => ({ label: '경고', text: warning.text })),
  ]
    .filter((item): item is { label: string; text: string } => Boolean(item.text))
    .map((item) => ({ label: item.label, text: formatExplanationText(item.text) }))
