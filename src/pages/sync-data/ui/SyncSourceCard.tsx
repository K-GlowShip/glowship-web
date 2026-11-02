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
      <CardContent className="flex flex-col gap-20pxr">
        <div className="flex items-start justify-between gap-12pxr">
          <div className="min-w-0">
            <h2 className="text-h3 font-bold">{source.name}</h2>
            <p className="text-b2 text-muted-foreground">{source.system}</p>
          </div>
          <Badge variant={isError ? 'danger' : 'success'}>{SYNC_STATUS_LABEL[source.status]}</Badge>
        </div>
        <div className="flex items-end justify-between gap-12pxr">
          <div>
            <p className="text-caption text-muted-foreground">마지막 수집</p>
            <p className={cn('text-b1 font-bold', isError && 'text-danger')}>
              {formatYYYYMMDDHHmm(source.lastCollectedAt)} KST
            </p>
          </div>
          {/* TODO: 동기화 API 확정 후 요청 연결 */}
          <Button variant="secondary" size="sm">
            {isError ? '다시 수집' : '동기화'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
