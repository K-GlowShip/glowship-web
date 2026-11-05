import { RefreshCw } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

import {
  canReanalyze,
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  type DelayCase,
  RESULT_CLASS_BADGE_VARIANT,
  RESULT_CLASS_LABEL,
} from '../model/delay-center'
import { useReanalysis } from '../model/use-reanalysis'

interface DelayDetailHeaderProps {
  delayCase: DelayCase
}

/**
 * 지연 상세의 제목 줄. 선적 번호와 상태·결과 분류, 재분석 버튼을 보여 준다.
 * 한 선적에 상품이 여럿일 수 있어 대표 상품은 적지 않고, 영향받는 상품은 아래 상품별 재고 영향에서 본다.
 */
export function DelayDetailHeader({ delayCase }: DelayDetailHeaderProps) {
  const { mutate: reanalyze, isPending: isReanalyzing } = useReanalysis()

  return (
    <header className="flex items-start justify-between gap-16pxr">
      <div className="flex items-end gap-12pxr">
        {/* 라벨도 제목 안에 두어, 스크린 리더가 "선적 번호 OCN-…"으로 함께 읽게 한다 */}
        <h2 className="text-h1 font-bold">
          <span className="block text-caption font-normal text-muted-foreground">선적 번호</span>
          {delayCase.shipmentCode}
        </h2>
        <Badge variant={DELAY_STATUS_BADGE_VARIANT[delayCase.status]}>
          {DELAY_STATUS_LABEL[delayCase.status]}
        </Badge>
        {delayCase.analysis && (
          <Badge variant={RESULT_CLASS_BADGE_VARIANT[delayCase.analysis.resultClass]} dot={false}>
            {RESULT_CLASS_LABEL[delayCase.analysis.resultClass]}
          </Badge>
        )}
      </div>
      {canReanalyze(delayCase) && (
        <Button
          variant="secondary"
          aria-busy={isReanalyzing || undefined}
          onClick={() => !isReanalyzing && reanalyze()}
        >
          <RefreshCw className={cn(isReanalyzing && 'animate-spin')} aria-hidden="true" />
          재분석
        </Button>
      )}
    </header>
  )
}
