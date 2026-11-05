import { Info } from 'lucide-react'

import { Tooltip } from './Tooltip'

interface InfoTipProps {
  /** 설명 대상의 이름. 스크린 리더가 "○○ 설명"으로 읽는다. */
  label: string
  description: string
}

/** 정보 아이콘. 마우스를 올리거나 포커스하면 설명을 보여 준다 */
export function InfoTip({ label, description }: InfoTipProps) {
  return (
    <Tooltip content={description}>
      <button
        type="button"
        aria-label={`${label} 설명`}
        className="cursor-pointer rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
      >
        <Info className="size-14pxr" aria-hidden="true" />
      </button>
    </Tooltip>
  )
}
