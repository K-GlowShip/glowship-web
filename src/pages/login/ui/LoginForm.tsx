import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { type ChangeEvent, type SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router'

import { env, ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import { DEMO_ACCOUNT } from '../model/demo-login'
import { useLogin } from '../model/use-login'
import { type LoginFormErrors, type LoginFormValues, validateLogin } from '../model/validate-login'

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { mutate: submitLogin, isPending, error: loginError, reset } = useLogin()

  const handleChange = (field: keyof LoginFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: event.target.value }
    setValues(next)
    if (hasSubmitted) {
      setErrors(validateLogin(next))
    }
    if (loginError) {
      reset()
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) {
      return
    }

    const nextErrors = validateLogin(values)
    setHasSubmitted(true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    submitLogin(values, { onSuccess: () => navigate(ROUTES.DASHBOARD, { replace: true }) })
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

      {loginError && <FieldError id="login-error">{loginError.message}</FieldError>}

      <Button type="submit" size="lg" loading={isPending} className="mt-16pxr w-full">
        로그인
      </Button>

      {/* 이 줄의 높이를 바꾸면 `LoginSkeleton`의 자리도 맞춘다 */}
      {env.isDemoLogin && (
        <p className="text-center text-caption text-muted-foreground">
          데모 계정: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
        </p>
      )}
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
