import { type SubmitEvent, useState } from 'react'

import { isUnauthorizedError, type OperatingRuleSet } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { DateInput } from '@/shared/ui/date-range-input'
import { DrawerBody, DrawerFooter } from '@/shared/ui/drawer'
import { FieldError } from '@/shared/ui/form-field'

import {
  type RuleSetFormErrors,
  type RuleSetFormValues,
  toCreateRequest,
  toInitialFormValues,
  validateRuleSetForm,
} from '../model/operating-rule-form'
import {
  getLeadTimeName,
  OPERATING_RULE_ERROR,
  SEA_TRANSIT_NOTE,
  SUPPORTED_SALES_BASIS_DAYS,
  toLeadTimeMatrices,
} from '../model/operating-rule-text'
import { useCreateOperatingRuleSet } from '../model/use-create-operating-rule-set'
import { DaysInput } from './DaysInput'
import { LeadTimeMatrixTable } from './LeadTimeMatrixTable'
import { PartialPolicyField } from './PartialPolicyField'
import { SettingRow } from './SettingRow'

interface RuleSetFormProps {
  companyId: string
  /** 값을 채울 기준 버전. 저장된 운영 기준이 없으면 `undefined` */
  base: OperatingRuleSet | undefined
  onSaved: () => void
}

const LEAD_TIME_ERROR_ID = 'rule-lead-time-error'

/** 서버가 시각을 UTC 날짜로 비교하므로 같은 기준의 오늘이다 */
const getTodayUtc = () => new Date().toISOString().slice(0, 10)

/** 운영 기준 새 버전을 저장하는 폼. 기준 버전의 값을 채워 두고, 바꿀 값만 고친다. */
export function RuleSetForm({ companyId, base, onSaved }: RuleSetFormProps) {
  const [values, setValues] = useState<RuleSetFormValues>(() => toInitialFormValues(base))
  const [errors, setErrors] = useState<RuleSetFormErrors>({})
  const [serverError, setServerError] = useState('')
  const { mutate: save, isPending } = useCreateOperatingRuleSet()
  const baseLeadTimes = base?.leadTimes ?? []

  // 오늘 이전·오늘부터 적용하는 버전은 저장 즉시 쓰이므로, 선택 대기 중인 분석이 재분석 필요가 된다(명세 4.2)
  const isAppliedNow = values.effectiveDate !== '' && values.effectiveDate <= getTodayUtc()

  const update = (patch: Partial<RuleSetFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }))
    setErrors({})
    setServerError('')
  }

  const updateLeadTimeDays = (index: number, days: string) =>
    update({ leadTimeDays: values.leadTimeDays.map((value, i) => (i === index ? days : value)) })

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (isPending) {
      return
    }

    const inputErrors = validateRuleSetForm(values)
    setErrors(inputErrors)
    if (Object.keys(inputErrors).length > 0) {
      // 오류 표시가 그려진 뒤 첫 오류 칸으로 포커스를 옮긴다(오류 칸이 화면 밖에 있을 수 있다)
      setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    save(toCreateRequest(companyId, values, baseLeadTimes), {
      onSuccess: onSaved,
      onError: (error) => {
        // 세션이 끝난 오류(401)는 전역 처리가 로그인 화면으로 보낸다
        if (!isUnauthorizedError(error)) {
          setServerError(error.message)
        }
      },
    })
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
      <DrawerBody className="flex flex-col gap-32pxr">
        <section aria-labelledby="rule-basic-title">
          <h3 id="rule-basic-title" className="pb-4pxr text-b1 font-bold">
            기본 기준
          </h3>
          <SettingRow id="rule-effective-date" label="적용 시작일" error={errors.effectiveDate}>
            {/* 버튼이라 입력칸용 `required`는 넘기지 않는다 */}
            {(inputProps) => (
              <DateInput
                id={inputProps.id}
                aria-invalid={inputProps['aria-invalid']}
                aria-describedby={inputProps['aria-describedby']}
                label="적용 시작일"
                className="w-184pxr"
                value={values.effectiveDate}
                onChange={(effectiveDate) => update({ effectiveDate })}
              />
            )}
          </SettingRow>
          <SettingRow id="rule-safety-stock-days" label="안전재고" error={errors.safetyStockDays}>
            {(inputProps) => (
              <DaysInput
                {...inputProps}
                value={values.safetyStockDays}
                onChange={(event) => update({ safetyStockDays: event.target.value })}
              />
            )}
          </SettingRow>
          <div className="flex items-center justify-between gap-16pxr border-b border-border py-12pxr">
            <div>
              <p className="text-b2 text-foreground">판매 기준</p>
              <p className="text-caption text-muted-foreground">
                분석이 {SUPPORTED_SALES_BASIS_DAYS}일만 계산할 수 있어 바꿀 수 없습니다.
              </p>
            </div>
            <p className="pr-12pxr text-b1 tabular-nums">
              {SUPPORTED_SALES_BASIS_DAYS}
              <span className="pl-8pxr text-b2 text-muted-foreground">일</span>
            </p>
          </div>
          <PartialPolicyField
            value={values.isPartialFulfillmentAllowed}
            onChange={(isPartialFulfillmentAllowed) => update({ isPartialFulfillmentAllowed })}
          />
          {isAppliedNow && (
            <p
              role="status"
              className="mt-12pxr rounded-card bg-warning-bg p-12pxr text-b2 text-warning"
            >
              오늘이나 그 전부터 적용하면 저장하는 즉시 쓰입니다. 이 고객사에서 선택을 기다리는
              분석은 재분석이 필요한 상태로 바뀝니다.
            </p>
          )}
        </section>

        <section aria-labelledby="rule-lead-times-title" className="flex flex-col gap-16pxr">
          <div>
            <h3 id="rule-lead-times-title" className="text-b1 font-bold">
              리드타임
            </h3>
            <p className="text-caption text-muted-foreground">
              출발 창고별 일수(달력일)입니다. 항목과 창고는 현재 버전과 같고 일수만 바꿀 수
              있습니다.
            </p>
          </div>
          {baseLeadTimes.length === 0 ? (
            <p className="text-b2 text-muted-foreground">
              저장된 운영 기준이 없어 리드타임을 입력할 수 없습니다. 창고 정보가 있어야 입력할 수
              있습니다.
            </p>
          ) : (
            toLeadTimeMatrices(baseLeadTimes).map((matrix) => (
              <LeadTimeMatrixTable
                key={matrix.key}
                matrix={matrix}
                columnClassName="w-112pxr"
                // 입력칸과 같은 자리에 막힌 칸으로 두어, 입력할 수 없는 조합임이 바로 보이게 한다
                renderEmpty={() => (
                  <div className="flex justify-end">
                    <span className="flex h-44pxr w-96pxr items-center justify-center rounded-control bg-disabled text-caption text-disabled-foreground">
                      해당 없음
                    </span>
                  </div>
                )}
                renderCell={({ index, leadTime }) => {
                  const isInvalid = Boolean(errors.leadTimeDays?.[index])
                  return (
                    <div className="flex justify-end">
                      <DaysInput
                        required
                        // 표의 머리글만으로는 어느 칸인지 읽히지 않아 칸마다 전체 이름을 붙인다
                        aria-label={getLeadTimeName(leadTime)}
                        aria-invalid={isInvalid ? true : undefined}
                        aria-describedby={isInvalid ? LEAD_TIME_ERROR_ID : undefined}
                        value={values.leadTimeDays[index]}
                        onChange={(event) => updateLeadTimeDays(index, event.target.value)}
                      />
                    </div>
                  )
                }}
              />
            ))
          )}
          <p className="text-caption text-muted-foreground">{SEA_TRANSIT_NOTE}</p>
          {errors.leadTimeDays && (
            <FieldError id={LEAD_TIME_ERROR_ID}>
              {OPERATING_RULE_ERROR.LEAD_TIME_DAYS_INVALID}
            </FieldError>
          )}
        </section>
      </DrawerBody>

      <DrawerFooter className="flex flex-col gap-12pxr">
        {serverError && <FieldError id="rule-form-error">{serverError}</FieldError>}
        <div className="flex items-center justify-between gap-16pxr">
          <p>저장하면 새 버전이 만들어지고 기존 버전은 그대로 남습니다.</p>
          <Button type="submit" loading={isPending} className="shrink-0">
            새 버전 저장
          </Button>
        </div>
      </DrawerFooter>
    </form>
  )
}
