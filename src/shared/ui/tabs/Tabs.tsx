import * as TabsPrimitive from '@radix-ui/react-tabs'
import { type ComponentProps, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'

export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col', className)} {...props} />
  )
}

interface IndicatorPosition {
  left: number
  width: number
}

/**
 * 탭 목록. 활성 탭 아래의 밑줄이 탭을 옮길 때 다음 탭으로 미끄러져 이동한다.
 * 활성 탭(`data-state="active"`)의 위치와 너비를 재서 밑줄을 맞추므로, 탭 글자 너비가 바뀌어도(굵기 변화 등) 따라간다.
 */
export function TabsList({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null)
  // 처음 자리를 잡을 때는 0에서 날아오지 않도록, 첫 측정 뒤에만 이동 효과를 켠다
  const [isAnimated, setIsAnimated] = useState(false)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) {
      return
    }

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[data-state="active"]')
      setIndicator(active ? { left: active.offsetLeft, width: active.offsetWidth } : null)
    }

    measure()
    const frame = requestAnimationFrame(() => setIsAnimated(true))
    const mutationObserver = new MutationObserver(measure)
    mutationObserver.observe(list, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    })
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(list)

    return () => {
      cancelAnimationFrame(frame)
      mutationObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn('relative flex items-center gap-24pxr border-b border-border', className)}
      {...props}
    >
      {children}
      {indicator && (
        <span
          aria-hidden="true"
          data-slot="tabs-indicator"
          className={cn(
            'pointer-events-none absolute bottom-0 left-0 -mb-px h-2pxr bg-primary',
            isAnimated &&
              'transition-[transform,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
          )}
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      )}
    </TabsPrimitive.List>
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex cursor-pointer items-center gap-4pxr px-4pxr py-10pxr text-b1 whitespace-nowrap text-muted-foreground transition-colors outline-none',
        'hover:text-foreground',
        'data-[state=active]:font-bold data-[state=active]:text-primary',
        'disabled:cursor-not-allowed disabled:text-disabled-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('outline-none', className)}
      {...props}
    />
  )
}
