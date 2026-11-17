import type { ReactNode } from 'react'

import { FieldError } from '@/shared/ui/form-field'
import { Label } from '@/shared/ui/label'

/** 입력칸에 그대로 펼쳐 쓰는 속성. 이름표·도움말·오류 문구와 이어 준다 */
interface InputA11yProps {
  id: string
  required: true
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

interface SettingRowProps {
  id: string
  label: string
  help?: string
  error?: string
  children: (inputProps: InputA11yProps) => ReactNode
}

/** 설정 한 줄: 왼쪽에 이름과 설명, 오른쪽에 짧은 입력칸. 값이 짧은 숫자·날짜라 칸을 화면 폭만큼 늘리지 않는다 */
export function SettingRow({ id, label, help, error, children }: SettingRowProps) {
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const describedBy = [help && helpId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-4pxr border-b border-border py-12pxr last:border-b-0">
      <div className="flex items-center justify-between gap-16pxr">
        <div className="min-w-0">
          <Label htmlFor={id} className="font-normal">
            {label}
          </Label>
          {help && (
            <p id={helpId} className="text-caption text-muted-foreground">
              {help}
            </p>
          )}
        </div>
        <div className="shrink-0">
          {children({
            id,
            required: true,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy || undefined,
          })}
        </div>
      </div>
      {error && (
        <div className="text-right">
          <FieldError id={errorId}>{error}</FieldError>
        </div>
      )}
    </div>
  )
}
