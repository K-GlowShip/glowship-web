import { RefreshCw } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

import {
  canReanalyze,
  DELAY_STATUS_BADGE_VARIANT,
  DELAY_STATUS_LABEL,
  type DelayCase,
  formatProductLabel,
} from '../model/delay-center'
import { useReanalysis } from '../model/use-reanalysis'

interface DelayDetailHeaderProps {
  delayCase: DelayCase
}

/** 지연 상세의 제목 줄. 선적 번호와 상태, 대표 상품·분석 실행 ID, 재분석 버튼을 보여 준다. */
export function DelayDetailHeader({ delayCase }: DelayDetailHeaderProps) {
  const { mutate: reanalyze, isPending: isReanalyzing } = useReanalysis()

  return (
    <header className="flex items-start justify-between gap-16pxr">
      <div className="flex flex-col gap-4pxr">
        <div className="flex items-center gap-12pxr">
          <h2 className="text-h1 font-bold">{delayCase.shipmentCode}</h2>
          <Badge variant={DELAY_STATUS_BADGE_VARIANT[delayCase.status]}>
            {DELAY_STATUS_LABEL[delayCase.status]}
          </Badge>
        </div>
        <p className="text-b1 text-muted-foreground">
          {[formatProductLabel(delayCase), delayCase.runCode && `분석 ${delayCase.runCode}`]
            .filter(Boolean)
            .join(' · ')}
        </p>
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
