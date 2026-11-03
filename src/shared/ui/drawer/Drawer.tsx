import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

export function Drawer(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

/** 화면 오른쪽에서 열리는 패널. 오버레이 클릭, Esc, 닫기 버튼으로 닫힌다. */
export function DrawerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="drawer-overlay"
        className="fixed inset-0 z-50 bg-foreground/40 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in motion-reduce:animate-none"
      />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-640pxr max-w-full flex-col bg-card shadow-[-8px_0_32px_rgba(37,35,49,0.12)] outline-none',
          'data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in motion-reduce:animate-none',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DrawerHeader({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex items-start justify-between gap-16pxr border-b border-border p-24pxr',
        className,
      )}
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

export function DrawerTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-h3 font-bold', className)}
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn('mt-4pxr text-b2 text-muted-foreground', className)}
      {...props}
    />
  )
}

export function DrawerBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn('min-h-0 flex-1 overflow-y-auto p-24pxr', className)}
      {...props}
    />
  )
}

export function DrawerFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('border-t border-border p-24pxr text-caption text-muted-foreground', className)}
      {...props}
    />
  )
}
