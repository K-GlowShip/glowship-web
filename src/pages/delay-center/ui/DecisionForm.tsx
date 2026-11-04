import { Check, Info } from 'lucide-react'
import { type SubmitEvent, useRef, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import {
  CLIENT_ROLE,
  type ClientRole,
  type DelayOption,
  getSelectableOptions,
  OPTION_TYPE,
} from '../model/delay-center'
import {
  DECISION_FORM_TEXT,
  DRAFT_SAVED_MESSAGE,
  ONLY_KEEP_PLAN_GUIDE,
} from '../model/delay-center-text'
import { validateDecision } from '../model/validate-decision'
import { NO_OPTION, OptionChoice } from './OptionChoice'

const TEXT_MAX_LENGTH = 600

interface DecisionFormProps {
  role: ClientRole
  options: DelayOption[]
}

/**
 * 팀원은 의견·초안을, 팀장은 최종 선택을 한다. 역할에 맞는 버튼 하나만 보여 준다.
 * 초안은 실행 가능 여부와 상관없이 모든 대응안을 고를 수 있고 대응안과 의견 중 하나만 있으면 된다.
 * 최종 선택은 실행 가능한 대응안만 고를 수 있고 이유가 필수다.
 */
export function DecisionForm({ role, options }: DecisionFormProps) {
  const isLead = role === CLIENT_ROLE.LEAD
  const labels = DECISION_FORM_TEXT[role]
  const selectable = getSelectableOptions(role, options)
  const onlyKeepPlan = isLead && selectable.every((option) => option.type === OPTION_TYPE.KEEP_PLAN)
  const recommendedId = selectable.find((option) => option.recommended)?.id ?? NO_OPTION

  const [optionId, setOptionId] = useState(isLead ? recommendedId : NO_OPTION)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  // 대응안이 없다는 오류는 대응안 칸의 문제라서, 이유·의견 칸은 대응안이 있는데 오류일 때(팀원은 둘 다 없을 때)만 오류로 표시한다.
  const isTextInvalid = error !== '' && (!isLead || optionId !== NO_OPTION)

  const validate = () => {
    const message = validateDecision(role, { optionId, text })
    setError(message)
    return message === ''
  }

  // TODO: POST /analysis-runs/{runId}/drafts(팀원), /final-decision(팀장, Idempotency-Key 필요) 연동
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) {
      // 오류를 읽은 키보드·스크린리더 사용자가 바로 고칠 수 있게 입력 칸으로 옮긴다. 이 변경은 다음 렌더 전에 반영되지 않아서 직접 계산한다.
      if (!isLead || optionId !== NO_OPTION) {
        textRef.current?.focus()
      }
      return
    }
    // 저장 안내는 팀원의 초안 저장에만 보여 준다. 팀장의 최종 선택은 연동 후 선택 완료 상태로 바뀐다.
    setSaved(!isLead)
  }

  const clearFeedback = () => {
    setError('')
    setSaved(false)
  }

  return (
    <form className="flex flex-col gap-16pxr" onSubmit={handleSubmit} noValidate>
      <OptionChoice
        legend={labels.optionLabel}
        role={role}
        options={options}
        value={optionId}
        allowNone={!isLead}
        guide={onlyKeepPlan ? ONLY_KEEP_PLAN_GUIDE : undefined}
        onChange={(value) => {
          setOptionId(value)
          clearFeedback()
        }}
      />

      <div className="flex flex-col gap-8pxr">
        <Label htmlFor="decision-text">
          {labels.textLabel} {isLead && <span className="text-danger">*</span>}
        </Label>
        <Textarea
          ref={textRef}
          id="decision-text"
          aria-invalid={isTextInvalid}
          aria-describedby={isTextInvalid ? 'decision-error' : undefined}
          maxLength={TEXT_MAX_LENGTH}
          placeholder={labels.textPlaceholder}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            clearFeedback()
          }}
        />
        <p className="text-right text-caption text-muted-foreground">
          {text.length}/{TEXT_MAX_LENGTH}
        </p>
      </div>

      {isLead && (
        <div className="flex gap-12pxr rounded-card bg-info-bg p-16pxr text-info">
          <Info className="mt-2pxr size-18pxr shrink-0" aria-hidden="true" />
          <div className="flex flex-col gap-2pxr">
            <p className="text-b1 font-bold">실제 출고는 변경되지 않습니다</p>
            <p className="text-b2">
              최종 선택은 의사결정 기록입니다. 실제 재고 이동과 출고는 별도 운영 절차에 따라 진행해
              주세요.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-12pxr">
        {error && (
          <p id="decision-error" role="alert" className="mr-auto text-caption text-danger">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="mr-auto text-caption text-success">
            {DRAFT_SAVED_MESSAGE}
          </p>
        )}
        <Button type="submit" size="lg" variant={isLead ? 'primary' : 'secondary'}>
          {isLead && <Check aria-hidden="true" />}
          {labels.submit}
        </Button>
      </div>
    </form>
  )
}
