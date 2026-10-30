import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { type ChangeEvent, type SubmitEvent, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import { type LoginFormErrors, type LoginFormValues, validateLogin } from '../model/validate-login'

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (field: keyof LoginFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    if (hasSubmitted) {
      setErrors(validateLogin(next))
    }
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors = validateLogin(values)
    setHasSubmitted(true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      // TODO(GLOW-76): 서버 로그인 API 확정 후 요청 연결 (비밀번호는 btoa()로 Base64 인코딩해서 전송)
      console.log('login submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-16pxr" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4pxr">
        <Label htmlFor="login-email">이메일</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            placeholder="name@company.com"
            className="pl-40pxr"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            value={values.email}
            onChange={handleChange('email')}
          />
        </div>
        {errors.email && <FieldError id="login-email-error">{errors.email}</FieldError>}
      </div>

      <div className="flex flex-col gap-4pxr">
        <Label htmlFor="login-password">비밀번호</Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-12pxr size-18pxr -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="px-40pxr"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            value={values.password}
            onChange={handleChange('password')}
          />
          <button
            type="button"
            className="absolute top-1/2 right-12pxr -translate-y-1/2 cursor-pointer text-muted-foreground outline-none hover:text-foreground focus-visible:text-primary"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <Eye className="size-18pxr" aria-hidden="true" />
            ) : (
              <EyeOff className="size-18pxr" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && <FieldError id="login-password-error">{errors.password}</FieldError>}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} className="mt-16pxr w-full">
        로그인
      </Button>
    </form>
  )
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="text-caption text-danger">
      {children}
    </p>
  )
}
