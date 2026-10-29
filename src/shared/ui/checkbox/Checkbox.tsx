import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'size-18pxr shrink-0 cursor-pointer rounded-sm border border-input bg-card text-primary-foreground transition-colors outline-none',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/30',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled disabled:text-disabled-foreground',
        'disabled:data-[state=checked]:border-border disabled:data-[state=checked]:bg-disabled',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-14pxr" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
