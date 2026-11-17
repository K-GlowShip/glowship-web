import type { ReactNode } from 'react'

import type { OperatingRuleSet } from '@/shared/api'
import { formatYYYYMMDD } from '@/shared/lib/kst-date'

import {
  getLeadTimeRoute,
  LEAD_TIME_TYPE_LABEL,
  PARTIAL_POLICY_LABEL,
  toPartialPolicy,
} from '../model/operating-rule-text'

interface RuleSetSheetProps {
  ruleSet: OperatingRuleSet
  /** 제목 오른쪽에 두는 버튼 */
  action?: ReactNode
}

/** 버전 하나의 운영 기준. 핵심 값 세 개를 크게 두고 리드타임은 그 아래에 조용히 나열한다 */
export function RuleSetSheet({ ruleSet, action }: RuleSetSheetProps) {
  const { versionNo, effectiveDate, author, createdAt, leadTimes } = ruleSet

  return (
    <article className="flex min-w-0 flex-col gap-32pxr">
      <header className="flex flex-wrap items-start justify-between gap-16pxr">
        <div>
          <h2 className="text-h2 font-bold">v{versionNo}</h2>
          <p className="text-b2 text-muted-foreground tabular-nums">
            {effectiveDate}부터 적용 · {author.displayName ?? '다른 관리자'} 등록{' '}
            {formatYYYYMMDD(createdAt)}
          </p>
        </div>
        {action}
      </header>

      {/* 값을 상자에 담지 않고 가는 선으로만 나눈다. 숫자는 크고 가늘게, 단위는 숫자 머리 높이에 작게 올린다 */}
      <dl className="grid gap-y-24pxr border-y border-border py-24pxr sm:grid-cols-3">
        <KeyFigure label="안전재고" value={ruleSet.safetyStockDays} unit="일" />
        <KeyFigure label="판매 기준" value={ruleSet.salesBasisDays} unit="일" />
        <KeyFigure
          label="부분 출고"
          value={PARTIAL_POLICY_LABEL[toPartialPolicy(ruleSet.isPartialFulfillmentAllowed)]}
        />
      </dl>

      <section aria-labelledby="rule-sheet-lead-times">
        <h3 id="rule-sheet-lead-times" className="pb-8pxr text-b1 font-bold">
          리드타임
        </h3>
        {leadTimes.length === 0 ? (
          <p className="text-b2 text-muted-foreground">등록된 리드타임이 없습니다.</p>
        ) : (
          <table className="w-full text-b1">
            <tbody>
              {leadTimes.map((leadTime) => (
                <tr
                  key={`${leadTime.leadTimeType}-${leadTime.warehouse.warehouseId}-${leadTime.toRegionCode}`}
                  className="border-b border-border last:border-b-0"
                >
                  <th
                    scope="row"
                    className="w-120pxr py-12pxr text-left font-normal text-muted-foreground"
                  >
                    {LEAD_TIME_TYPE_LABEL[leadTime.leadTimeType] ?? leadTime.leadTimeType}
                  </th>
                  <td className="py-12pxr">{getLeadTimeRoute(leadTime)}</td>
                  <td className="py-12pxr text-right tabular-nums">
                    {leadTime.days}
                    <span className="pl-2pxr text-b2 text-muted-foreground">일</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </article>
  )
}

function KeyFigure({
  label,
  value,
  unit,
}: {
  label: string
  value: string | number
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-4pxr border-border sm:border-l sm:pl-24pxr sm:first:border-l-0 sm:first:pl-0">
      <dt className="text-b2 text-muted-foreground">{label}</dt>
      <dd className="flex items-start text-kpi font-light tracking-[-0.03em] tabular-nums">
        {value}
        {unit && (
          <span className="pt-[0.2em] pl-4pxr text-b1 font-normal tracking-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </dd>
    </div>
  )
}
