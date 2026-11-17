import { type ChangeEvent, type SubmitEvent, useRef, useState } from 'react'

import { type CreatedClientUser, isUnauthorizedError } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { DrawerBody, DrawerFooter } from '@/shared/ui/drawer'
import { FieldError, FormField, RequiredMark } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'

import {
  CLIENT_USER_SERVER_ERROR,
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  INPUT_LENGTH_MARGIN,
} from '../model/client-user-text'
import { useCreateClientUser } from '../model/use-create-client-user'
import {
  type ClientUserFormErrors,
  type ClientUserFormValues,
  EMPTY_CLIENT_USER_FORM,
  validateClientUser,
} from '../model/validate-client-user'
import { CreatedSummary } from './CreatedSummary'
import { PasswordInput } from './PasswordInput'
import { RoleSelector } from './RoleSelector'

interface CreateClientUserFormProps {
  /** 계정을 만들 고객사 ID */
  companyId: string
}

type TextField = 'email' | 'password' | 'displayName'

/** 입력 오류에 서버가 거절한 이유 중 어느 칸에도 속하지 않는 것(`form`)을 더한 것 */
type FormErrors = ClientUserFormErrors & { form?: string }

/** 서버가 거절한 이유를 보여 줄 칸. 이메일·비밀번호 오류는 해당 칸에, 나머지(권한·고객사 상태 등)는 폼 아래에 보여 준다 */
const toServerErrors = (code: string, message: string): FormErrors => {
  switch (code) {
    case CLIENT_USER_SERVER_ERROR.EMAIL_DUPLICATED:
      return { email: message }
    case CLIENT_USER_SERVER_ERROR.INVALID_PASSWORD_FORMAT:
      return { password: message }
    default:
      return { form: message }
  }
}

/** 담당 고객사에 팀원·팀장 계정을 만드는 폼. 만들고 나면 만든 계정을 보여 주고 이어서 다른 계정을 만들 수 있다. */
export function CreateClientUserForm({ companyId }: CreateClientUserFormProps) {
  const [values, setValues] = useState<ClientUserFormValues>(EMPTY_CLIENT_USER_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [created, setCreated] = useState<CreatedClientUser | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const { mutate: create, isPending } = useCreateClientUser()

  const update = (next: ClientUserFormValues) => {
    setValues(next)
    // 입력이 바뀌면 서버가 거절한 이유는 더는 맞지 않으므로 지우고, 제출한 적이 있으면 입력 오류를 다시 계산한다
    setErrors(hasSubmitted ? validateClientUser(next) : {})
  }

  const handleChange = (field: TextField) => (event: ChangeEvent<HTMLInputElement>) =>
    update({ ...values, [field]: event.target.value })

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (isPending) {
      return
    }

    const inputErrors = validateClientUser(values)
    setHasSubmitted(true)
    setErrors(inputErrors)
    if (Object.keys(inputErrors).length > 0) {
      // 오류 표시가 그려진 뒤 첫 오류 칸으로 포커스를 옮긴다(오류 칸이 화면 밖에 있을 수 있다)
      setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    create(
      { companyId, values },
      {
        onSuccess: setCreated,
        onError: (error) => {
          // 세션이 끝난 오류(401)는 전역 처리가 로그인 화면으로 보낸다
          if (!isUnauthorizedError(error)) {
            setErrors(toServerErrors(error.code, error.message))
          }
        },
      },
    )
  }

  const resetForm = () => {
    setValues(EMPTY_CLIENT_USER_FORM)
    setErrors({})
    setHasSubmitted(false)
    setCreated(null)
  }

  const handleCreateAnother = () => {
    resetForm()
    // 폼이 다시 그려진 뒤에 첫 칸(이름)으로 돌아온다
    setTimeout(() => firstFieldRef.current?.focus())
  }

  if (created) {
    return (
      <DrawerBody>
        <CreatedSummary user={created} onCreateAnother={handleCreateAnother} />
      </DrawerBody>
    )
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
      <DrawerBody className="flex flex-col gap-20pxr">
        <p className="text-caption text-muted-foreground">
          <RequiredMark /> 모든 항목은 필수입니다.
        </p>

        <RoleSelector
          value={values.roleCode}
          onChange={(roleCode) => update({ ...values, roleCode })}
        />

        <FormField id="client-user-name" label="이름" error={errors.displayName}>
          {(inputProps) => (
            <Input
              {...inputProps}
              ref={firstFieldRef}
              // 드로어가 열리면 바로 입력할 수 있게 한다. 포커스가 이미 안에 있어서 Radix가 닫기 버튼으로 옮기지 않는다
              autoFocus
              autoComplete="off"
              placeholder="예: 홍길동"
              maxLength={DISPLAY_NAME_MAX_LENGTH + INPUT_LENGTH_MARGIN}
              value={values.displayName}
              onChange={handleChange('displayName')}
            />
          )}
        </FormField>

        <FormField id="client-user-email" label="이메일" error={errors.email}>
          {(inputProps) => (
            <Input
              {...inputProps}
              type="email"
              autoComplete="off"
              placeholder="name@company.com"
              maxLength={EMAIL_MAX_LENGTH + INPUT_LENGTH_MARGIN}
              value={values.email}
              onChange={handleChange('email')}
            />
          )}
        </FormField>

        <FormField
          id="client-user-password"
          label="초기 비밀번호"
          help="영문·숫자 6~16자로 정하고, 사용자에게 전달해 주세요."
          error={errors.password}
        >
          {(inputProps) => (
            <PasswordInput
              {...inputProps}
              value={values.password}
              onChange={handleChange('password')}
            />
          )}
        </FormField>
      </DrawerBody>

      <DrawerFooter className="flex flex-col gap-12pxr">
        {errors.form && <FieldError id="client-user-form-error">{errors.form}</FieldError>}
        <Button type="submit" loading={isPending} className="self-end">
          계정 만들기
        </Button>
      </DrawerFooter>
    </form>
  )
}
