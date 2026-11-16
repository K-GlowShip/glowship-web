import { formatYYYYMMDDHHmm } from '@/shared/lib/kst-date'

import type { DelayCase } from '../model/delay-center'
import { EMPTY_TEXT } from '../model/delay-center-text'

interface AnalysisInfoProps {
  delayCase: DelayCase
}

/** 이 분석을 믿어도 되는지 판단하는 정보. 분석 실행 ID·버전, 데이터 기준 시각, 수집 경고를 한 곳에 모은다. */
export function AnalysisInfo({ delayCase }: AnalysisInfoProps) {
  const latestRun = delayCase.runs.find((run) => run.isLatest)

  return (
    <div className="flex flex-col gap-4pxr text-caption text-muted-foreground">
      <p>
        {[
          delayCase.runCode &&
            `분석 ${delayCase.runCode}${latestRun ? ` · v${latestRun.versionNo}` : ''}`,
          delayCase.baseDataAt
            ? `데이터 기준 ${formatYYYYMMDDHHmm(delayCase.baseDataAt)} KST`
            : EMPTY_TEXT.DATA_BASIS,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {delayCase.dataNotice && <p className="text-warning">{delayCase.dataNotice}</p>}
    </div>
  )
}
