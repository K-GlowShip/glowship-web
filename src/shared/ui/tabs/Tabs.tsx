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

    // 탭 안의 글자(건수 등)가 나중에 채워져 탭 너비가 바뀌어도 밑줄이 따라가도록, 목록뿐 아니라 각 탭의 크기도 지켜본다
    const resizeObserver = new ResizeObserver(() => measure())
    const observeTabs = () => {
      for (const tab of list.querySelectorAll('[role="tab"]')) {
        resizeObserver.observe(tab)
      }
    }
    const measure = () => {
      const active = list.querySelector<HTMLElement>('[data-state="active"]')
      const next = active ? { left: active.offsetLeft, width: active.offsetWidth } : null
      // 위치가 그대로면 같은 값을 다시 넣지 않아 불필요한 렌더를 막는다
      setIndicator((prev) =>
        prev?.left === next?.left && prev?.width === next?.width ? prev : next,
      )
    }

    observeTabs()
    measure()
    const frame = requestAnimationFrame(() => setIsAnimated(true))
    const mutationObserver = new MutationObserver(() => {
      observeTabs()
      measure()
    })
    mutationObserver.observe(list, {
      attributes: true,
      attributeFilter: ['data-state'],
      childList: true,
      subtree: true,
    })
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
      className={cn(
        // 좁은 화면에서는 가로로 밀 수 있게 한다. 밑줄 막대가 아래로 삐져나가면 세로 스크롤이 생기므로,
        // 아래 경계선은 border 대신 안쪽 그림자로 그려 막대가 그 위에 겹쳐지게 한다
        'relative flex items-center gap-24pxr overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--color-border)]',
        className,
      )}
      {...props}
    >
      {children}
      {indicator && (
        <span
          aria-hidden="true"
          data-slot="tabs-indicator"
          className={cn(
            'pointer-events-none absolute bottom-0 left-0 h-2pxr bg-primary',
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
