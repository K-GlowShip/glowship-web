import { cn } from '@/shared/lib/cn'
import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import {
  DELAY_STATUS,
  type DelayCase,
  isClosed,
  NO_RISK_MESSAGE,
  RESULT_CLASS,
} from '../model/delay-center'
import { ANALYSIS_NOTICE, DEFAULT_PROGRESS_STEP } from '../model/delay-center-text'

interface StatusNoticeProps {
  delayCase: DelayCase
}

type Tone = 'info' | 'warning' | 'danger' | 'success' | 'neutral'

const TONE_CLASS = {
  info: 'bg-info-bg text-info',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  success: 'bg-success-bg text-success',
  neutral: 'bg-background text-muted-foreground',
} as const satisfies Record<Tone, string>

interface Notice {
  tone: Tone
  title: string
  /** 제목 아래에 덧붙이는 설명 */
  detail?: string
}

/**
 * 지금 상태에서 사용자가 알아야 하는 안내. 위치를 하나로 고정하고 한 종류만 보여 준다.
 * 상태를 추가하면 여기도 적어야 컴파일된다.
 */
export function StatusNotice({ delayCase }: StatusNoticeProps) {
  const notice = getNotice(delayCase)
  if (!notice) {
    return null
  }

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-4pxr rounded-card px-20pxr py-16pxr',
        TONE_CLASS[notice.tone],
      )}
    >
      <p className="text-b1 font-bold">{notice.title}</p>
      {notice.detail && <p className="text-b2">{notice.detail}</p>}
    </div>
  )
}

const getNotice = (delayCase: DelayCase): Notice | null => {
  const { status, analysis } = delayCase

  switch (status) {
    case DELAY_STATUS.ANALYZING:
      return {
        tone: 'info',
        title: `${delayCase.progressStep ?? DEFAULT_PROGRESS_STEP} 중`,
        detail: ANALYSIS_NOTICE.IN_PROGRESS,
      }
    case DELAY_STATUS.NO_DELAY:
      return { tone: 'neutral', title: ANALYSIS_NOTICE.NO_DELAY }
    case DELAY_STATUS.ON_HOLD:
      return {
        tone: 'danger',
        title: delayCase.failureMessage ?? ANALYSIS_NOTICE.ON_HOLD,
        detail: ANALYSIS_NOTICE.REANALYZE_GUIDE,
      }
    case DELAY_STATUS.NO_RISK:
      return {
        tone: 'success',
        title: ANALYSIS_NOTICE.NO_RISK,
        detail:
          analysis?.resultClass === RESULT_CLASS.PURE_NO_RISK ||
          analysis?.resultClass === RESULT_CLASS.WARNING_NO_RISK
            ? NO_RISK_MESSAGE[analysis.resultClass]
            : undefined,
      }
    case DELAY_STATUS.NEEDS_REANALYSIS:
      // 자료 변경(STALE)이면 저장된 결과가 있고, 도구 실패(FAILED)면 결과가 없다.
      // 설명 생성만 실패한 FAILED는 계산 결과는 있지만 설명이 없다.
      if (analysis && analysis.explanation === null) {
        return {
          tone: 'danger',
          title: ANALYSIS_NOTICE.EXPLANATION_FAILED,
          detail: ANALYSIS_NOTICE.REANALYZE_GUIDE,
        }
      }
      return analysis
        ? {
            tone: 'warning',
            title: ANALYSIS_NOTICE.STALE,
            detail: delayCase.staleReason ?? undefined,
          }
        : {
            tone: 'danger',
            title: delayCase.failureMessage ?? ANALYSIS_NOTICE.NO_RESULT,
            detail: ANALYSIS_NOTICE.REANALYZE_GUIDE,
          }
    case DELAY_STATUS.READY:
    case DELAY_STATUS.FINALIZED:
      if (!analysis) {
        // 결과가 있어야 하는 상태인데 없다. 서버 응답이 비었을 때를 위한 안내다.
        return {
          tone: 'danger',
          title: delayCase.failureMessage ?? ANALYSIS_NOTICE.NO_RESULT,
          detail: ANALYSIS_NOTICE.REANALYZE_GUIDE,
        }
      }
      if (status === DELAY_STATUS.READY && analysis.explanation === null) {
        return {
          tone: 'danger',
          title: ANALYSIS_NOTICE.EXPLANATION_FAILED,
          detail: ANALYSIS_NOTICE.REANALYZE_GUIDE,
        }
      }
      return isClosed(delayCase) && status === DELAY_STATUS.READY
        ? {
            tone: 'neutral',
            title: ANALYSIS_NOTICE.CLOSED,
            detail: delayCase.closedAt
              ? `${formatYYYYMMDDHHmm(delayCase.closedAt)} 종료`
              : undefined,
          }
        : null
  }
}
