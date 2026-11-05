import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

interface TooltipProps {
  /** 툴팁을 여는 요소. 키보드로 포커스할 수 있는 요소(버튼 등)여야 한다. */
  children: ReactNode
  /** 툴팁에 보여 줄 내용 */
  content: ReactNode
  side?: ComponentProps<typeof TooltipPrimitive.Content>['side']
  className?: string
}

/** 앱 루트에 한 번 둔다. 툴팁 사이를 옮길 때 지연 없이 바로 열리게 하려면 Provider를 공유해야 한다. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={150}>{children}</TooltipPrimitive.Provider>
}

/**
 * 마우스를 올리거나 키보드로 포커스하면 뜨는 짧은 설명. Esc로 닫힌다. `TooltipProvider` 안에서 써야 한다.
 * 터치 화면에서는 열리지 않으니, 꼭 알아야 하는 내용은 툴팁에만 두지 않는다.
 */
export function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 max-w-260pxr rounded-control bg-foreground px-10pxr py-6pxr text-caption text-card',
            // 한글이 글자 중간에서 끊기지 않게 단어 단위로 줄을 바꾸고, 내용의 줄바꿈(\n)은 그대로 보여 준다
            'break-keep whitespace-pre-line',
            'data-[state=delayed-open]:animate-popover-in motion-reduce:animate-none',
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
