import { Info } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface InfoTipProps {
  /** 설명 대상의 이름. 스크린 리더가 "○○ 설명"으로 읽는다. */
  label: string
  description: string
}

/**
 * 정보 아이콘. 누르면 설명이 열리고, 바깥을 누르거나 Esc를 누르면 닫힌다.
 * 마우스를 올리는 방식(`Tooltip`)은 터치 화면에서 열리지 않아서, 눌러서 여는 `Popover`로 만든다.
 */
export function InfoTip({ label, description }: InfoTipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label} 설명`}
          className="cursor-pointer rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
        >
          <Info className="size-14pxr" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        // 툴팁과 같은 어두운 말풍선 모양. 한글이 글자 중간에서 끊기지 않게 단어 단위로 줄을 바꾸고, 내용의 줄바꿈(\n)은 그대로 보여 준다
        className="max-w-260pxr rounded-control border-0 bg-foreground px-10pxr py-6pxr text-caption break-keep whitespace-pre-line text-card shadow-none"
      >
        {description}
      </PopoverContent>
    </Popover>
  )
}
