import { useState } from 'react'

import {
  canDecide,
  CLIENT_ROLE,
  type ClientRole,
  type DelayAnalysis,
  type DelayCase,
  DETAIL_SECTION,
  getDetailSections,
  getOptionsMissingData,
  getSelectableOptions,
  hasNoFeasibleOption,
  NO_OPTION,
  OPTION_TYPE,
} from '../model/delay-center'
import { ANALYSIS_NOTICE } from '../model/delay-center-text'
import { AiExplanationCard } from './AiExplanationCard'
import { AtRiskOrders } from './AtRiskOrders'
import { DecisionForm } from './DecisionForm'
import { DecisionSection } from './DecisionSection'
import { DelayDetailHeader } from './DelayDetailHeader'
import { DetailChapter, DetailSubsection } from './DetailChapter'
import { ImpactSection } from './ImpactSection'
import { OptionCompare } from './OptionCompare'
import { RunHistory } from './RunHistory'
import { StageTimeline } from './StageTimeline'
import { StatusNotice } from './StatusNotice'

interface DelayDetailProps {
  delayCase: DelayCase
  /** 선택 권한이 없는 계정이면 null */
  role: ClientRole | null
}

/** 선택 영역의 안내. 팀장은 최종 선택을, 팀원은 의견·초안을 남긴다 */
const DECISION_DESCRIPTION = {
  [CLIENT_ROLE.LEAD]: '이유를 남기고 최종 대응안을 기록합니다',
  [CLIENT_ROLE.MEMBER]: '팀장이 참고할 의견과 초안을 남깁니다',
} as const

/**
 * 지연 상세. 머리(어떤 건이고 얼마나 큰가)와 상태 안내 아래에 세 영역을 순서대로 둔다:
 * 01 현재 상황(무엇이 위험한가) → 02 대응안 비교(무엇을 할 수 있는가) → 03 대응안 선택 및 의견(누가 무엇을 골랐는가). 맨 아래는 이전 분석 이력이다.
 * 대응안은 02의 카드에서 고르고, 03에서 이유·의견을 적어 저장한다. 상태마다 보여 줄 섹션은 `getDetailSections`가 정한다.
 */
export function DelayDetail({ delayCase, role }: DelayDetailProps) {
  const { analysis } = delayCase
  const sections = getDetailSections(delayCase)
  // 지금 대응안을 고를 수 있는 역할. 권한이 없거나 선택할 수 없는 상태(종료·재분석 필요 등)면 null
  const decisionRole = role && canDecide(delayCase) ? role : null
  const selectable =
    decisionRole && analysis ? getSelectableOptions(decisionRole, analysis.options) : []
  // 팀장은 추천 대응안을 미리 골라 둔다. 팀원은 의견만 저장할 수도 있어 비워 둔다
  const [optionId, setOptionId] = useState(
    decisionRole === CLIENT_ROLE.LEAD
      ? (selectable.find((option) => option.recommended)?.id ?? NO_OPTION)
      : NO_OPTION,
  )
  const showsDecision = sections.includes(DETAIL_SECTION.DECISION)

  return (
    <article className="flex min-w-0 flex-col gap-24pxr">
      <DelayDetailHeader delayCase={delayCase} />
      <StatusNotice delayCase={delayCase} />

      <DetailChapter
        id="situation-title"
        step="01"
        title="현재 상황"
        description="선적이 어디에 있고, 어떤 상품과 주문이 위험한지 봅니다"
      >
        <DetailSubsection id="stage-title" title="운송 단계">
          <StageTimeline delayCase={delayCase} />
        </DetailSubsection>
        {analysis && sections.includes(DETAIL_SECTION.IMPACT) && (
          <ImpactSection analysis={analysis} delayCase={delayCase} />
        )}
        {analysis && sections.includes(DETAIL_SECTION.RISK_ORDERS) && (
          <AtRiskOrders orders={analysis.riskOrders} />
        )}
      </DetailChapter>

      {analysis && sections.includes(DETAIL_SECTION.OPTIONS) && (
        <DetailChapter
          id="options-title"
          step="02"
          title="대응안 비교"
          description={
            decisionRole
              ? '결과를 비교하고 카드를 눌러 대응안을 고릅니다'
              : '대응안별 결과와 근거를 비교합니다'
          }
        >
          <OptionNotices options={analysis.options} />
          <OptionCompare
            options={analysis.options}
            explanation={analysis.explanation}
            opinions={delayCase.opinions}
            selection={
              decisionRole
                ? {
                    value: optionId,
                    selectableIds: new Set(selectable.map((option) => option.id)),
                    onChange: setOptionId,
                  }
                : undefined
            }
            finalOptionId={delayCase.finalDecision?.optionId}
          />
          {sections.includes(DETAIL_SECTION.EXPLANATION) && analysis.explanation && (
            <AiExplanationCard
              explanation={analysis.explanation}
              showRecommendation={!analysis.options.some((option) => option.recommended)}
            />
          )}
        </DetailChapter>
      )}

      {analysis && showsDecision && (
        <DetailChapter
          id="decision-title"
          step="03"
          title="대응안 선택 및 의견"
          description={decisionRole ? DECISION_DESCRIPTION[decisionRole] : undefined}
        >
          <DecisionSection delayCase={delayCase} analysis={analysis}>
            {decisionRole ? (
              <DecisionForm
                role={decisionRole}
                selectedOption={selectable.find((option) => option.id === optionId)}
                onlyKeepPlan={
                  decisionRole === CLIENT_ROLE.LEAD &&
                  selectable.every((option) => option.type === OPTION_TYPE.KEEP_PLAN)
                }
                onClearOption={() => setOptionId(NO_OPTION)}
              />
            ) : (
              <p className="text-b2 text-muted-foreground">
                {role ? ANALYSIS_NOTICE.CANNOT_DECIDE : ANALYSIS_NOTICE.NO_DECIDE_ROLE}
              </p>
            )}
          </DecisionSection>
        </DetailChapter>
      )}

      {sections.includes(DETAIL_SECTION.HISTORY) && <RunHistory runs={delayCase.runs} />}
    </article>
  )
}

/** 대응안을 판정하지 못하거나 실행할 수 없는 경우의 안내. 사유는 각 대응안 카드에 있다. */
function OptionNotices({ options }: { options: DelayAnalysis['options'] }) {
  const notices = [
    hasNoFeasibleOption(options) && ANALYSIS_NOTICE.NO_FEASIBLE_OPTION,
    getOptionsMissingData(options).length > 0 && ANALYSIS_NOTICE.MISSING_DATA,
  ].filter((notice) => notice !== false)

  return notices.map((notice) => (
    <p
      key={notice}
      role="status"
      className="rounded-card bg-warning-bg px-16pxr py-12pxr text-b2 text-warning"
    >
      {notice}
    </p>
  ))
}
