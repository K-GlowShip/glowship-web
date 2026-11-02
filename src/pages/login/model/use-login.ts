import { useMutation } from '@tanstack/react-query'

import { login } from '@/shared/api'
import { env } from '@/shared/config'
import { encodeBase64 } from '@/shared/lib/encode-base64'

import { isDemoAccount } from './demo-login'
import type { LoginFormValues } from './validate-login'

export const useLogin = () =>
  useMutation({
    mutationFn: async (values: LoginFormValues) => {
      // 서버 없이 확인하는 배포에서는 데모 계정이면 요청을 보내지 않는다
      if (env.isDemoLogin && isDemoAccount(values)) {
        return
      }
      await login({ email: values.email.trim(), password: encodeBase64(values.password) })
    },
  })
