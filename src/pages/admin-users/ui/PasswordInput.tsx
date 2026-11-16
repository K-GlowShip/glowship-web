import { Eye, EyeOff } from 'lucide-react'
import { type ComponentProps, useState } from 'react'

import { Input } from '@/shared/ui/input'

/** 보기·숨기기 버튼이 붙은 비밀번호 입력칸. 나머지 속성은 `Input`에 그대로 넘긴다 */
export function PasswordInput(props: Omit<ComponentProps<typeof Input>, 'type' | 'className'>) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = isVisible ? Eye : EyeOff

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? 'text' : 'password'}
        autoComplete="new-password"
        className="pr-40pxr"
      />
      <button
        type="button"
        className="absolute top-1/2 right-12pxr -translate-y-1/2 cursor-pointer text-muted-foreground outline-none hover:text-foreground focus-visible:text-primary"
        aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
        onClick={() => setIsVisible((prev) => !prev)}
      >
        <Icon className="size-18pxr" aria-hidden="true" />
      </button>
    </div>
  )
}
