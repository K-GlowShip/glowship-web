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

/**
 * 마우스를 올리거나 키보드로 포커스하면 뜨는 짧은 설명. Esc로 닫힌다.
 * 터치 화면에서는 열리지 않으니, 꼭 알아야 하는 내용은 툴팁에만 두지 않는다.
 */
export function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="tooltip-content"
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 max-w-260pxr rounded-control bg-foreground px-10pxr py-6pxr text-caption text-card',
              'data-[state=delayed-open]:animate-popover-in motion-reduce:animate-none',
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
