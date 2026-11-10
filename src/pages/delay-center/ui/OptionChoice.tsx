import type { ReactNode } from 'react'

import { DECISION_TEXT } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format-number'
import { Badge } from '@/shared/ui/badge'

import {
  type ClientRole,
  type DelayOption,
  FEASIBILITY,
  FEASIBILITY_BADGE_VARIANT,
  FEASIBILITY_LABEL,
  getSelectableOptions,
  type MemberOpinion,
  OPTION_TYPE_LABEL,
  REASON_LABEL,
} from '../model/delay-center'
import { NO_OPTION_LABEL, OPTION_NOT_SELECTABLE } from '../model/delay-center-text'
import { RecommendedBadge } from './RecommendedBadge'

/** 대응안을 고르지 않았을 때의 값. 팀원이 의견만 저장할 때 쓴다. */
export const NO_OPTION = ''

const RADIO_NAME = 'decision-option'
const CARD_CLASS = cn(
  // relative가 없으면 화면 읽기 전용으로 숨긴 라디오(sr-only, 절대 위치)가 스크롤 영역 밖에 놓여서,
  // 카드를 누를 때 브라우저가 그 입력을 보이게 하려고 문서 전체를 스크롤해 화면이 밀려난다.
  'relative flex cursor-pointer items-start gap-12pxr rounded-card border border-border bg-card px-16pxr py-12pxr',
  'has-checked:border-primary has-checked:bg-primary-50 has-checked:shadow-[inset_0_0_0_1px_var(--color-primary)]',
  'has-focus-visible:ring-[3px] has-focus-visible:ring-primary/30',
  'has-disabled:cursor-not-allowed has-disabled:bg-background',
)

interface OptionChoiceProps {
  legend: string
  role: ClientRole
  options: DelayOption[]
  /** 대응안마다 몇 명이 의견을 냈는지 보여 주는 데 쓴다 */
  opinions: MemberOpinion[]
  /** 고른 대응안의 id. 고르지 않았으면 `NO_OPTION` */
  value: string
  /** 대응안을 안 고르고 의견만 저장할 수 있게 하는 항목을 보여 줄지(팀원) */
  allowNone: boolean
  /** 선택 목록 아래에 덧붙이는 안내 */
  guide?: string
  onChange: (value: string) => void
}

/**
 * 대응안을 드롭다운에 숨기지 않고 펼쳐서 고르게 한다. 숫자 비교는 위의 대응안 비교 표에서 하므로 여기에는 이름과 상태만 두고,
 * 표에 없는 '팀원 의견 N건'을 붙여서 의견이 몰린 대응안을 고르는 자리에서 바로 보게 한다.
 * 선택할 수 없는 대응안도 목록에 남기고 사유를 한 줄 보여 줘서 왜 못 고르는지 알 수 있게 한다.
 * 팀장은 실행 가능한 안만, 팀원은 확인 필요인 안까지 고를 수 있다.
 */
export function OptionChoice({
  legend,
  role,
  options,
  opinions,
  value,
  allowNone,
  guide,
  onChange,
}: OptionChoiceProps) {
  const selectableIds = new Set(getSelectableOptions(role, options).map((option) => option.id))

  return (
    <fieldset className="flex min-w-0 flex-col gap-8pxr">
      <legend className="mb-8pxr text-b2 font-bold text-foreground">{legend}</legend>

      {allowNone && (
        <ChoiceCard checked={value === NO_OPTION} value={NO_OPTION} onChange={onChange}>
          <span className="text-b1 font-bold">{NO_OPTION_LABEL}</span>
        </ChoiceCard>
      )}

      {options.map((option) => {
        const selectable = selectableIds.has(option.id)
        const opinionCount = opinions.filter(({ optionId }) => optionId === option.id).length
        const detail = getDetail(option, selectable)

        return (
          <ChoiceCard
            key={option.id}
            checked={value === option.id}
            value={option.id}
            disabled={!selectable}
            onChange={onChange}
          >
            <span className="flex flex-wrap items-center gap-x-8pxr gap-y-2pxr">
              <span className={cn('text-b1 font-bold', !selectable && 'text-muted-foreground')}>
                {OPTION_TYPE_LABEL[option.type]}
              </span>
              {option.recommended && <RecommendedBadge />}
              {option.feasibility !== FEASIBILITY.FEASIBLE && (
                <Badge variant={FEASIBILITY_BADGE_VARIANT[option.feasibility]} dot={false}>
                  {FEASIBILITY_LABEL[option.feasibility]}
                </Badge>
              )}
              {opinionCount > 0 && (
                <span className="ml-auto text-caption text-muted-foreground">
                  {DECISION_TEXT.MEMBER_OPINION} {formatNumber(opinionCount)}건
                </span>
              )}
            </span>
            {detail && <span className="text-b2 text-muted-foreground">{detail}</span>}
          </ChoiceCard>
        )
      })}

      {guide && <p className="text-caption text-muted-foreground">{guide}</p>}
    </fieldset>
  )
}

/** 사유가 있으면 한 줄로 보여 준다. 선택할 수 없는데 사유가 없으면 선택할 수 없다는 것만 알린다. */
const getDetail = (option: DelayOption, selectable: boolean) => {
  if (option.reasonCode) {
    return REASON_LABEL[option.reasonCode]
  }
  return selectable ? null : OPTION_NOT_SELECTABLE
}

interface ChoiceCardProps {
  checked: boolean
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  children: ReactNode
}

/** 라디오 하나를 카드 모양으로 그린다. 실제 입력은 화면 읽기 전용으로 숨기고 카드 전체가 눌린다. */
function ChoiceCard({ checked, value, disabled, onChange, children }: ChoiceCardProps) {
  return (
    <label className={CARD_CLASS}>
      <input
        type="radio"
        name={RADIO_NAME}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="mt-2pxr flex size-18pxr shrink-0 items-center justify-center rounded-full border-2 border-input bg-card peer-checked:border-primary peer-checked:*:bg-primary peer-disabled:bg-disabled"
      >
        <span className="size-8pxr rounded-full" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-4pxr">{children}</span>
    </label>
  )
}
