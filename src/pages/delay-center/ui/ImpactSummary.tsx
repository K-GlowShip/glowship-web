import { cn } from '@/shared/lib/cn'

import {
  countRiskOrdersByAttribution,
  type DelayAnalysis,
  getIncreasedShortage,
  RESULT_CLASS,
  RESULT_CLASS_LABEL,
} from '../model/delay-center'

interface ImpactSummaryProps {
  analysis: DelayAnalysis
}

/** 상품별 재고 영향 제목 옆의 한 줄 요약. 결과 분류에 따라 문구가 달라진다. */
export function ImpactSummary({ analysis }: ImpactSummaryProps) {
  const { impacts, resultClass, riskOrders } = analysis

  switch (resultClass) {
    case RESULT_CLASS.FORECAST_ONLY_READY:
    case RESULT_CLASS.READY_ORDER_RISK: {
      // 계획대로 입고돼도 위험했을 기존 위험 주문은 '지연으로 인한' 건수에서 뺀다(명세 4.5 `riskAttribution`)
      const { delayInduced } = countRiskOrdersByAttribution(riskOrders)
      // 위험 주문 → 부족 수량 순서로 고정한다. 없다는 말은 안심할 내용이라 중립색으로 두고, 있을 때만 경고색으로 강조한다
      return (
        <>
          <span className={cn(delayInduced > 0 && 'text-danger')}>
            지연으로 인한 위험 주문 {delayInduced > 0 ? `${delayInduced}건` : '없음'}
          </span>
          {' · '}
          <span className="text-danger">
            부족 수량 {getIncreasedShortage(impacts).toLocaleString()}개
          </span>
        </>
      )
    }
    case RESULT_CLASS.PURE_NO_RISK:
    case RESULT_CLASS.WARNING_NO_RISK:
      return RESULT_CLASS_LABEL[resultClass]
  }
}
