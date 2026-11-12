import { Check, Info } from 'lucide-react'
import { type SubmitEvent, useRef, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import {
  CLIENT_ROLE,
  type ClientRole,
  type DelayOption,
  NO_OPTION,
  OPTION_TYPE_LABEL,
} from '../model/delay-center'
import {
  DECISION_FORM_TEXT,
  DECISION_RECORD_NOTICE,
  DRAFT_SAVED_MESSAGE,
  ONLY_KEEP_PLAN_GUIDE,
} from '../model/delay-center-text'
import { validateDecision } from '../model/validate-decision'

const TEXT_MAX_LENGTH = 600

/** 저장을 눌렀을 때의 결과. 어느 대응안을 고른 상태에서 나온 것인지 함께 둔다 */
interface Feedback {
  optionId: string
  error: string
  saved: boolean
}

const NO_FEEDBACK = { error: '', saved: false }

interface DecisionFormProps {
  role: ClientRole
  /** 대응안 카드에서 고른 대응안. 고르지 않았으면 undefined */
  selectedOption: DelayOption | undefined
  /** 팀장이 고를 수 있는 대응안이 현재 계획 유지뿐인지 */
  onlyKeepPlan: boolean
  /** 고른 대응안을 비운다(팀원이 의견만 저장할 때) */
  onClearOption: () => void
}

/**
 * 팀원은 의견·초안을, 팀장은 최종 선택을 한다. 대응안은 위쪽 대응안 카드에서 고르고, 여기서는 고른 대응안을 확인하고 이유·의견을 적어 저장한다.
 * 초안은 실행 가능 여부와 상관없이 모든 대응안을 고를 수 있고 대응안과 의견 중 하나만 있으면 된다.
 * 최종 선택은 실행 가능한 대응안만 고를 수 있고 이유가 필수다.
 */
export function DecisionForm({
  role,
  selectedOption,
  onlyKeepPlan,
  onClearOption,
}: DecisionFormProps) {
  const isLead = role === CLIENT_ROLE.LEAD
  const labels = DECISION_FORM_TEXT[role]
  const optionId = selectedOption?.id ?? NO_OPTION

  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  // 오류·저장 안내는 그것이 나온 대응안에서만 보여 준다. 대응안을 바꾸면 따로 지우지 않아도 사라진다
  const { error, saved } = feedback?.optionId === optionId ? feedback : NO_FEEDBACK
  // 대응안이 없다는 오류는 대응안 칸의 문제라서, 이유·의견 칸은 대응안이 있는데 오류일 때(팀원은 둘 다 없을 때)만 오류로 표시한다.
  const isTextInvalid = error !== '' && (!isLead || optionId !== NO_OPTION)

  // TODO: POST /analysis-runs/{runId}/drafts(팀원), /final-decision(팀장, Idempotency-Key 필요) 연동
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = validateDecision(role, { optionId, text })
    // 저장 안내는 팀원의 초안 저장에만 보여 준다. 팀장의 최종 선택은 연동 후 선택 완료 상태로 바뀐다.
    setFeedback({ optionId, error: message, saved: message === '' && !isLead })
    if (message !== '') {
      // 오류를 읽은 키보드·스크린리더 사용자가 바로 고칠 수 있게 입력 칸으로 옮긴다. 이 변경은 다음 렌더 전에 반영되지 않아서 직접 계산한다.
      if (!isLead || optionId !== NO_OPTION) {
        textRef.current?.focus()
      }
    }
  }

  return (
    <form className="flex flex-col gap-20pxr" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4pxr">
        <p className="text-caption text-muted-foreground">선택한 대응안</p>
        <p className="flex flex-wrap items-baseline gap-x-12pxr gap-y-2pxr" aria-live="polite">
          {selectedOption ? (
            <span className="text-h2 font-bold">{OPTION_TYPE_LABEL[selectedOption.type]}</span>
          ) : (
            <span className="text-h3 text-muted-foreground">{labels.noOption}</span>
          )}
          {!isLead && selectedOption && (
            <button
              type="button"
              onClick={onClearOption}
              className="cursor-pointer rounded-control text-b2 text-muted-foreground underline outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
            >
              선택 해제
            </button>
          )}
        </p>
        {onlyKeepPlan && (
          <p className="text-caption text-muted-foreground">{ONLY_KEEP_PLAN_GUIDE}</p>
        )}
      </div>

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
            setFeedback(null)
          }}
        />
        <p className="text-right text-caption text-muted-foreground">
          {text.length}/{TEXT_MAX_LENGTH}
        </p>
      </div>

      {isLead && (
        <p className="flex items-center gap-6pxr text-caption text-muted-foreground">
          <Info className="size-14pxr shrink-0" aria-hidden="true" />
          {DECISION_RECORD_NOTICE}
        </p>
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
