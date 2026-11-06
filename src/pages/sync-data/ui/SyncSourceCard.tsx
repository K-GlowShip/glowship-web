import { getSyncBadge, isSyncError } from '@/entities/data-sync-run'
import type { LatestSyncRun } from '@/shared/api'
import { EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

interface SyncSourceCardProps {
  name: string
  run: LatestSyncRun
}

export function SyncSourceCard({ name, run }: SyncSourceCardProps) {
  const badge = getSyncBadge(run)
  const isError = isSyncError(run)

  return (
    <Card className={cn(isError && 'border-danger')}>
      <CardContent className="flex flex-col gap-20pxr">
        <div className="flex items-start justify-between gap-12pxr">
          <div className="min-w-0">
            <h2 className="text-h3 font-bold">{name}</h2>
            <p className="text-b2 text-muted-foreground">{run.sourceSystemName}</p>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <div className="flex items-end justify-between gap-12pxr">
          <div>
            <p className="text-caption text-muted-foreground">마지막 수집</p>
            <p className={cn('text-b1 font-bold', isError && 'text-danger')}>
              {run.lastSyncedAt ? `${formatYYYYMMDDHHmm(run.lastSyncedAt)} KST` : EMPTY_VALUE}
            </p>
          </div>
          {/* TODO: 수동 동기화 API(POST /data-sync-runs, 지금은 SHIPMENT만 지원) 연결 */}
          <Button variant="secondary" size="sm">
            {isError ? '다시 수집' : '동기화'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
