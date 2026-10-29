import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-22pxr w-36pxr shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-primary/30',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        'disabled:cursor-not-allowed disabled:data-[state=checked]:bg-disabled disabled:data-[state=unchecked]:bg-disabled',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-16pxr rounded-full bg-white transition-transform data-[state=checked]:translate-x-17pxr data-[state=unchecked]:translate-x-3pxr"
      />
    </SwitchPrimitive.Root>
  )
}
