import { PackageX, ShoppingCart, Sparkles, TriangleAlert } from 'lucide-react'

import { getOptionTypeLabel } from '@/entities/delay-event'
import type { AnalysisRunDetail } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { formatNumber } from '@/shared/lib/format-number'

import { formatBaseDataAt, getShortageTotal, stripEvidenceMarks } from '../model/history'

/** 당시 분석 요약: 실행 ID·분석 버전·기준 데이터 시각, 부족 수량·위험 주문 수, AI 설명, 경고 */
export function HistoryAnalysisSection({ run }: { run: AnalysisRunDetail }) {
  const { explanation } = run

  return (
    <section className="flex flex-col gap-20pxr border-t border-border pt-24pxr">
      <div>
        <h3 className="text-h3 font-bold">당시 분석 요약</h3>
        <p className="mt-4pxr text-caption text-muted-foreground">
          실행 ID {run.runCode ?? EMPTY_VALUE} · 분석 버전 v{run.versionNo}
        </p>
        <p className="text-caption text-muted-foreground">
          기준 데이터{' '}
          {run.inputBasis.dataBasisAt ? formatBaseDataAt(run.inputBasis.dataBasisAt) : EMPTY_VALUE}
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
                {stripEvidenceMarks(explanation.run_summary)}
              </dd>
            </div>
            <div>
              <dt className="font-bold">영향 요약</dt>
              <dd className="text-muted-foreground">
                {stripEvidenceMarks(explanation.risk_summary)}
              </dd>
            </div>
            {explanation.recommendation_explanation && (
              <div>
                <dt className="font-bold">추천 설명</dt>
                <dd className="text-muted-foreground">
                  {stripEvidenceMarks(explanation.recommendation_explanation)}
                </dd>
              </div>
            )}
            {explanation.option_explanations.length > 0 && (
              <div>
                <dt className="font-bold">대응안별 설명</dt>
                <dd>
                  <ul className="mt-8pxr flex flex-col gap-12pxr pl-12pxr">
                    {explanation.option_explanations.map((option) => (
                      <li key={option.option_type}>
                        <p className="font-bold text-primary">
                          {getOptionTypeLabel(option.option_type)}
                        </p>
                        <p className="text-muted-foreground">{stripEvidenceMarks(option.text)}</p>
                      </li>
                    ))}
                  </ul>
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
