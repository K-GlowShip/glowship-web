import { Link } from 'react-router'

import { delayCenterPath } from '@/shared/config'
import { buttonVariants } from '@/shared/ui/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'

import {
  formatBaseDataAt,
  formatSelectedAt,
  HISTORY_DISCLAIMER,
  HISTORY_STATUS_LABEL,
  type HistoryRecord,
} from '../model/history'

interface HistoryDetailDrawerProps {
  record: HistoryRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}

export function HistoryDetailDrawer({
  record,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: HistoryDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent onCloseAutoFocus={onCloseAutoFocus}>
        {record && <HistoryDetail record={record} />}
      </DrawerContent>
    </Drawer>
  )
}

function HistoryDetail({ record }: { record: HistoryRecord }) {
  const { analysis, comment } = record

  return (
    <>
      <DrawerHeader>
        <div className="flex flex-wrap items-center gap-12pxr">
          <DrawerTitle>
            {HISTORY_STATUS_LABEL[record.status]}: {record.option}
          </DrawerTitle>
        </div>
        <DrawerDescription>
          {record.shipmentCode} / {record.productName} · {record.selector} ·{' '}
          {formatSelectedAt(record.selectedAt)}
        </DrawerDescription>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-16pxr">
        <section className="flex flex-col gap-12pxr rounded-card bg-primary-50 p-20pxr">
          <p className="text-b1">선택 이유: {record.reason}</p>
          {comment && (
            <p className="text-b2 text-muted-foreground">
              {comment.author} · {comment.time} “{comment.text}”
            </p>
          )}
          <p className="text-caption text-muted-foreground">
            기준 데이터 {formatBaseDataAt(record.baseDataAt)} · 실행 ID {record.runCode}
          </p>
        </section>

        <section className="flex flex-col gap-12pxr rounded-card bg-primary-100 p-20pxr">
          <h3 className="text-h3 font-bold">당시 분석 요약</h3>
          <dl className="flex gap-32pxr">
            <div>
              <dt className="text-caption text-muted-foreground">부족 수량</dt>
              <dd className="text-h1 font-bold">{analysis.shortage.toLocaleString('ko-KR')}개</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">위험 주문</dt>
              <dd className="text-h1 font-bold text-danger">{analysis.riskOrders}건</dd>
            </div>
          </dl>
          <dl className="flex flex-col gap-8pxr text-b2">
            <div>
              <dt className="font-bold">분석 요약</dt>
              <dd className="text-muted-foreground">{analysis.runSummary}</dd>
            </div>
            <div>
              <dt className="font-bold">영향 요약</dt>
              <dd className="text-muted-foreground">{analysis.riskSummary}</dd>
            </div>
          </dl>
          {analysis.warnings.length > 0 && (
            <ul className="flex flex-col gap-4pxr text-b2 text-warning">
              {analysis.warnings.map((warning, index) => (
                <li key={`${warning.code}-${index}`}>{warning.text}</li>
              ))}
            </ul>
          )}
        </section>

        <Link
          to={delayCenterPath(record.delayEventId)}
          className={buttonVariants({ variant: 'secondary', className: 'self-start' })}
        >
          지연 건 상세 보기
        </Link>
      </DrawerBody>

      <DrawerFooter>{HISTORY_DISCLAIMER}</DrawerFooter>
    </>
  )
}
