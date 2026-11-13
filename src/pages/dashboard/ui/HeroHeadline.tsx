import { cn } from '@/shared/lib/cn'
import { formatHHmm, formatKoreanLongDate } from '@/shared/lib/kst-date'
import { formatNumber } from '@/shared/lib/format-number'
import { CountUp } from '@/shared/ui/count-up'

import type { HeroCopy } from '../model/hero-copy'

interface HeroHeadlineProps {
  copy: HeroCopy
  /** 강조 글자의 색. 바탕 면에 맞춰 쓰는 쪽이 정한다 */
  highlightClassName: string
  className?: string
}

/** 오늘의 한 문장. 강조 부분만 색을 달리하고, 건수는 0에서 올라온다 */
export function HeroHeadline({ copy, highlightClassName, className }: HeroHeadlineProps) {
  const { lead, highlightCount, highlightText, trail } = copy

  return (
    <h1 className={cn('font-light break-keep', className)}>
      {lead}
      <br />
      <span className={cn('font-medium tabular-nums', highlightClassName)}>
        {highlightCount !== null && (
          <CountUp value={highlightCount} format={(value) => formatNumber(Math.round(value))} />
        )}
        {highlightText}
      </span>
      {trail}
    </h1>
  )
}

interface HeroDatelineProps {
  /** 기준 시각(ISO 8601 UTC). 적재된 수집이 없으면 null */
  lastSyncedAt: string | null
  className?: string
}

/** 기준 날짜와 마지막 업데이트 시각을 작게 한 줄로 */
export function HeroDateline({ lastSyncedAt, className }: HeroDatelineProps) {
  return (
    <p className={cn('text-b2 font-bold', className)}>
      {lastSyncedAt
        ? `${formatKoreanLongDate(lastSyncedAt)} ${formatHHmm(lastSyncedAt)} 업데이트`
        : '아직 수집된 데이터가 없어요'}
    </p>
  )
}
