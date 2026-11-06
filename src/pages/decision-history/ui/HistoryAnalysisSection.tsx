import type { AnalysisRunDetail } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { formatNumber } from '@/shared/lib/format-number'

import { getShortageTotal } from '../model/history'

/** 당시 분석 요약: 부족 수량·위험 주문 수, 분석·영향 요약, 경고 */
export function HistoryAnalysisSection({ run }: { run: AnalysisRunDetail }) {
  const { explanation } = run

  return (
    <section className="flex flex-col gap-12pxr rounded-card bg-primary-100 p-20pxr">
      <h3 className="text-h3 font-bold">당시 분석 요약</h3>
      <dl className="flex gap-32pxr">
        <div>
          <dt className="text-caption text-muted-foreground">부족 수량</dt>
          <dd className="text-h1 font-bold">{formatNumber(getShortageTotal(run))}개</dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">위험 주문</dt>
          <dd className="text-h1 font-bold text-danger">{run.atRiskOrders.length}건</dd>
        </div>
      </dl>
      <dl className="flex flex-col gap-8pxr text-b2">
        <div>
          <dt className="font-bold">분석 요약</dt>
          <dd className="text-muted-foreground">{explanation?.run_summary ?? EMPTY_VALUE}</dd>
        </div>
        <div>
          <dt className="font-bold">영향 요약</dt>
          <dd className="text-muted-foreground">{explanation?.risk_summary ?? EMPTY_VALUE}</dd>
        </div>
      </dl>
      {explanation && explanation.warnings.length > 0 && (
        <ul className="flex flex-col gap-4pxr text-b2 text-warning">
          {explanation.warnings.map((warning, index) => (
            <li key={`${warning.code}-${index}`}>{warning.text}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
