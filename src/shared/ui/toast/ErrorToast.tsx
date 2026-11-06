import { CircleAlert, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'

export function ErrorToast({ id, message }: { id: string | number; message: string }) {
  return (
    <div className="flex w-356pxr max-w-[calc(100vw-2rem)] items-center gap-12pxr rounded-card border border-border bg-card py-12pxr pr-12pxr pl-16pxr shadow-[0_8px_32px_rgba(37,35,49,0.08)]">
      <CircleAlert className="size-20pxr shrink-0 text-danger" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-b2 text-foreground">{message}</p>
      <Button
        variant="ghost"
        size="icon"
        className="size-28pxr shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground active:bg-transparent"
        aria-label="닫기"
        onClick={() => toast.dismiss(id)}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  )
}
