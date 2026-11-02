import { Database } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

import { SYNC_STATUS_LABEL, type SyncSource } from '../model/sync-sources'

export function SyncSourceCard({ source }: { source: SyncSource }) {
  const isError = source.status === 'error'

  return (
    <Card className={cn(isError && 'border-danger')}>
      <CardContent className="flex flex-col gap-16pxr">
        <div className="flex items-start gap-12pxr">
          <span className="flex size-40pxr shrink-0 items-center justify-center rounded-control bg-primary-100 text-primary">
            <Database className="size-20pxr" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-h3 font-bold">{source.name}</h2>
            <p className="text-b2 text-muted-foreground">{source.system}</p>
          </div>
          <Badge variant={isError ? 'danger' : 'success'}>{SYNC_STATUS_LABEL[source.status]}</Badge>
        </div>
        <p className="text-b1 text-muted-foreground">
          마지막 수집 · {formatYYYYMMDDHHmm(source.lastCollectedAt)} KST
        </p>
        <div className="flex items-center justify-between gap-8pxr">
          <span className="text-caption text-muted-foreground">{source.interval}</span>
          {/* TODO: 동기화 API 확정 후 요청 연결 */}
          <Button variant="secondary" size="sm">
            {isError ? '다시 수집' : '동기화'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
