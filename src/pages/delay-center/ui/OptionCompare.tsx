import { Check } from 'lucide-react'

import { DECISION_TEXT, EMPTY_VALUE } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { formatMMDD } from '@/shared/lib/kst-date'
import { Badge } from '@/shared/ui/badge'

import {
  type AiExplanation,
  type DelayOption,
  FEASIBILITY_BADGE_VARIANT,
  FEASIBILITY_LABEL,
  type MemberOpinion,
  OPTION_TYPE_LABEL,
  REASON_LABEL,
} from '../model/delay-center'
import { OPTION_NOT_SELECTABLE } from '../model/delay-center-text'
import { RecommendedBadge } from './RecommendedBadge'

const RADIO_NAME = 'decision-option'

/** 대응안 수에 맞춰 넓은 화면에서 한 줄에 나란히 놓는다 */
const GRID_COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

interface OptionSelection {
  /** 고른 대응안의 id. 고르지 않았으면 `NO_OPTION` */
  value: string
  /** 이 사용자가 고를 수 있는 대응안의 id */
  selectableIds: ReadonlySet<string>
  onChange: (value: string) => void
}

interface OptionCompareProps {
  options: DelayOption[]
  /** AI 설명. 생성에 실패했으면 null이고 대응안별 설명과 추천 근거가 없다. */
  explanation: AiExplanation | null
  /** 대응안마다 몇 명이 의견을 냈는지 보여 주는 데 쓴다 */
  opinions: MemberOpinion[]
  /** 지금 선택할 수 있을 때만 준다. 없으면 비교만 하는 카드다 */
  selection?: OptionSelection
  /** 최종 선택된 대응안의 id */
  finalOptionId?: string
}

/**
 * 대응안을 같은 모양의 카드로 나란히 놓아 비교한다. 선택할 수 있는 상태면 카드가 곧 선택지다(라디오).
 * 카드마다 결과 숫자(회복 주문·남는 위험 주문) → 조건(예상 도착·커버 수량) → 근거 순서가 같아서 가로로 훑어 비교할 수 있다.
 * 근거는 서버가 계산한 사유(`reasonCode`) 라벨을 먼저 두고 AI의 대응안별 설명을 덧붙인다. 추천 대응안은 추천 근거가 이어진다.
 * 불가·확인 필요인 대응안도 숨기지 않으며, 판정할 수 없는 값은 빈 값 문자로 표시한다.
 */
export function OptionCompare({
  options,
  explanation,
  opinions,
  selection,
  finalOptionId,
}: OptionCompareProps) {
  const cards = options.map((option) => {
    const isSelectable = selection?.selectableIds.has(option.id) ?? false
    const isFinal = option.id === finalOptionId
    const opinionCount = opinions.filter(({ optionId }) => optionId === option.id).length
    const reason = option.reasonCode
      ? REASON_LABEL[option.reasonCode]
      : selection && !isSelectable
        ? OPTION_NOT_SELECTABLE
        : null
    const optionExplanation = explanation?.optionExplanations[option.type] ?? null
    const recommendation = option.recommended ? (explanation?.recommendation ?? null) : null

    const body = (
      <>
        <div className="flex flex-col gap-8pxr">
          <div className="flex items-start justify-between gap-8pxr">
            <span className="text-h3 font-bold">{OPTION_TYPE_LABEL[option.type]}</span>
            {selection && (
              <span
                aria-hidden="true"
                className="mt-4pxr flex size-18pxr shrink-0 items-center justify-center rounded-full border-2 border-input bg-card group-has-checked:border-primary group-has-checked:*:bg-primary group-has-disabled:bg-disabled"
              >
                <span className="size-8pxr rounded-full" />
              </span>
            )}
            {isFinal && (
              <span className="mt-4pxr flex shrink-0 items-center gap-4pxr text-caption font-bold text-primary">
                <Check className="size-14pxr" aria-hidden="true" />
                최종 선택
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6pxr">
            <Badge variant={FEASIBILITY_BADGE_VARIANT[option.feasibility]} dot={false}>
              {FEASIBILITY_LABEL[option.feasibility]}
            </Badge>
            {option.recommended && <RecommendedBadge />}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-12pxr gap-y-8pxr border-t border-border pt-16pxr">
          <Outcome label="회복 주문" value={option.delayInducedRecoveredOrders} unit="건" />
          <Outcome
            label="남은 위험 주문"
            value={option.notRecoveredOrders}
            unit="건"
            note={
              option.itemSecuredBlockedOrders
                ? `일부 품목만 확보 ${formatNumber(option.itemSecuredBlockedOrders)}건`
                : undefined
            }
          />
          <Condition
            label="예상 도착"
            value={option.expectedArrival ? formatMMDD(option.expectedArrival) : EMPTY_VALUE}
          />
          <Condition
            label="커버 수량"
            value={
              option.securableQuantity === null
                ? EMPTY_VALUE
                : `${formatNumber(option.securableQuantity)}개`
            }
          />
        </dl>

        {(reason || optionExplanation || recommendation) && (
          <div className="flex flex-col gap-6pxr border-t border-border pt-16pxr text-b2 text-muted-foreground">
            {reason && <p className="text-foreground">{reason}</p>}
            {optionExplanation && <p>{optionExplanation}</p>}
            {recommendation && (
              <p>
                <span className="font-bold text-foreground">추천 근거</span> {recommendation}
              </p>
            )}
          </div>
        )}

        {opinionCount > 0 && (
          <p className="mt-auto text-caption text-muted-foreground">
            {DECISION_TEXT.MEMBER_OPINION} {formatNumber(opinionCount)}건
          </p>
        )}
      </>
    )

    const className = cn(
      // relative가 없으면 화면 읽기 전용으로 숨긴 라디오(sr-only, 절대 위치)가 스크롤 영역 밖에 놓여서,
      // 카드를 누를 때 브라우저가 그 입력을 보이게 하려고 문서 전체를 스크롤해 화면이 밀려난다.
      'group relative flex min-w-0 flex-col gap-16pxr rounded-card border border-border bg-card p-20pxr',
      isFinal && 'border-primary bg-primary-50',
      selection &&
        (isSelectable
          ? 'cursor-pointer transition-colors hover:border-primary-300 has-checked:border-primary has-checked:bg-primary-50 has-checked:shadow-[inset_0_0_0_1px_var(--color-primary)] has-focus-visible:ring-[3px] has-focus-visible:ring-primary/30'
          : 'cursor-not-allowed bg-background'),
    )

    return selection ? (
      <label key={option.id} className={className}>
        <input
          type="radio"
          name={RADIO_NAME}
          value={option.id}
          checked={selection.value === option.id}
          disabled={!isSelectable}
          onChange={() => selection.onChange(option.id)}
          className="sr-only"
        />
        {body}
      </label>
    ) : (
      <li key={option.id} className={className}>
        {body}
      </li>
    )
  })

  const gridClass = cn('grid gap-12pxr sm:grid-cols-2', GRID_COLUMNS[options.length])

  return selection ? (
    <div role="radiogroup" aria-labelledby="options-title" className={gridClass}>
      {cards}
    </div>
  ) : (
    <ul className={gridClass}>{cards}</ul>
  )
}

interface OutcomeProps {
  label: string
  /** 판정할 수 없으면 null */
  value: number | null
  unit: string
  note?: string
}

/** 대응안의 결과 숫자. 카드에서 가장 먼저 읽히게 크고 가늘게 쓴다 */
function Outcome({ label, value, unit, note }: OutcomeProps) {
  return (
    <div className="flex flex-col">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="flex items-start text-h1 font-light tabular-nums">
        {value === null ? EMPTY_VALUE : formatNumber(value)}
        {value !== null && <span className="pt-[0.3em] pl-2pxr text-b2 font-normal">{unit}</span>}
      </dd>
      {/* 덧붙임이 없는 카드도 한 줄을 비워 두어 카드끼리 아래 줄이 맞게 한다 */}
      <dd className="min-h-18pxr text-caption text-muted-foreground">{note}</dd>
    </div>
  )
}

function Condition({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-b1 tabular-nums">{value}</dd>
    </div>
  )
}
