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
import { getLeadTimeName, SUPPORTED_SALES_BASIS_DAYS } from '../model/operating-rule-text'
import { useCreateOperatingRuleSet } from '../model/use-create-operating-rule-set'
import { DaysInput } from './DaysInput'
import { PartialPolicyField } from './PartialPolicyField'
import { SettingRow } from './SettingRow'

interface RuleSetFormProps {
  companyId: string
  /** 값을 채울 기준 버전. 저장된 운영 기준이 없으면 `undefined` */
  base: OperatingRuleSet | undefined
  onSaved: () => void
}

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
    if (isPending) {
      return
    }

    const inputErrors = validateRuleSetForm(values)
    setErrors(inputErrors)
    if (Object.keys(inputErrors).length > 0) {
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

        <section aria-labelledby="rule-lead-times-title">
          <h3 id="rule-lead-times-title" className="text-b1 font-bold">
            리드타임
          </h3>
          <p className="pb-4pxr text-caption text-muted-foreground">
            달력일 기준입니다. 항목과 창고는 현재 버전과 같고 일수만 바꿀 수 있습니다.
          </p>
          {baseLeadTimes.length === 0 ? (
            <p className="py-12pxr text-b2 text-muted-foreground">
              저장된 운영 기준이 없어 리드타임을 입력할 수 없습니다. 창고 정보가 있어야 입력할 수
              있습니다.
            </p>
          ) : (
            baseLeadTimes.map((leadTime, index) => (
              <SettingRow
                key={`${leadTime.leadTimeType}-${leadTime.warehouse.warehouseId}-${leadTime.toRegionCode}`}
                id={`rule-lead-time-${index}`}
                label={getLeadTimeName(leadTime)}
                error={errors.leadTimeDays?.[index]}
              >
                {(inputProps) => (
                  <DaysInput
                    {...inputProps}
                    value={values.leadTimeDays[index]}
                    onChange={(event) => updateLeadTimeDays(index, event.target.value)}
                  />
                )}
              </SettingRow>
            ))
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
