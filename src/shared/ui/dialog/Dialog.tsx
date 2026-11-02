import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

/** 화면 가운데에 뜨는 모달. 오버레이 클릭, Esc, 닫기 버튼으로 닫힌다. */
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-50 bg-foreground/40 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in motion-reduce:animate-none"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100%-2rem)] w-480pxr max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-panel bg-card shadow-[0_8px_32px_rgba(37,35,49,0.16)] outline-none',
          'data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in motion-reduce:animate-none',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex items-start justify-between gap-16pxr p-24pxr pb-0', className)}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <DialogPrimitive.Close asChild>
        <Button variant="ghost" size="icon" className="-mt-8pxr -mr-8pxr" aria-label="닫기">
          <X aria-hidden="true" />
        </Button>
      </DialogPrimitive.Close>
    </div>
  )
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-h3 font-bold wrap-break-word', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('mt-4pxr text-b2 text-muted-foreground', className)}
      {...props}
    />
  )
}

export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('min-h-0 flex-1 overflow-y-auto p-24pxr', className)}
      {...props}
    />
  )
}
