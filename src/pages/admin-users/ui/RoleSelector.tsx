import type { ClientRoleCode } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { RequiredMark } from '@/shared/ui/form-field'

import { CLIENT_ROLE_OPTIONS } from '../model/client-user-text'

interface RoleSelectorProps {
  value: ClientRoleCode
  onChange: (code: ClientRoleCode) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-8pxr">
      <legend className="mb-4pxr flex items-center gap-2pxr text-b2 font-bold text-foreground">
        역할
        <RequiredMark />
      </legend>
      {CLIENT_ROLE_OPTIONS.map(({ code, label, description }) => {
        const checked = value === code
        return (
          <label
            key={code}
            className={cn(
              'flex cursor-pointer items-start gap-12pxr rounded-card border px-16pxr py-12pxr transition-colors',
              checked ? 'border-primary bg-primary-50' : 'border-border hover:bg-muted',
            )}
          >
            <input
              type="radio"
              name="client-user-role"
              value={code}
              checked={checked}
              onChange={() => onChange(code)}
              className="mt-3pxr size-16pxr accent-primary"
            />
            <span className="flex flex-col gap-2pxr">
              <span className="text-b1 font-bold text-foreground">{label}</span>
              <span className="text-caption text-muted-foreground">{description}</span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
