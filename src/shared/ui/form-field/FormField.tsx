import type { ReactNode } from 'react'

import { Label } from '@/shared/ui/label'

/** 필수 항목 표시. 스크린 리더에는 입력칸의 `required`로 전달되므로 눈에 보이는 별표만 숨긴다 */
export function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-danger">
      *
    </span>
  )
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-caption text-danger">
      {children}
    </p>
  )
}

/** 입력칸에 그대로 펼쳐 쓰는 속성. 라벨·도움말·오류 문구와 이어 준다 */
interface InputA11yProps {
  id: string
  required: true
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  id: string
  label: string
  error?: string
  help?: string
  children: (inputProps: InputA11yProps) => ReactNode
}

/**
 * 필수 입력칸 하나: 라벨(+필수 표시), 입력칸, 도움말, 오류 문구.
 * 별표를 라벨 글자 안에 넣지 않아서 라벨의 접근 가능한 이름은 그대로다.
 */
export function FormField({ id, label, error, help, children }: FormFieldProps) {
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const describedBy = [help && helpId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-4pxr">
      <div className="flex items-center gap-2pxr">
        <Label htmlFor={id}>{label}</Label>
        <RequiredMark />
      </div>
      {children({
        id,
        required: true,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}
      {help && (
        <p id={helpId} className="text-caption text-muted-foreground">
          {help}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  )
}
