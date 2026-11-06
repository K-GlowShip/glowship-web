import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clearSession, markLoggedIn } from '@/entities/session'
import { isMeQuery, login, meQueryOptions } from '@/shared/api'
import { env } from '@/shared/config'
import { encodeBase64 } from '@/shared/lib/encode-base64'

import { isDemoAccount } from './demo-login'
import type { LoginFormValues } from './validate-login'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      // 서버 없이 확인하는 배포에서는 데모 계정이면 요청을 보내지 않는다
      if (env.isDemoLogin && isDemoAccount(values)) {
        markLoggedIn()
        return
      }
      await login({ email: values.email.trim(), password: encodeBase64(values.password) })
      // 이전 데모 로그인의 표시가 남아 있으면 실제 세션을 데모로 오인하므로 지운다
      clearSession()
      // 이전 사용자의 데이터가 새 사용자에게 보이지 않게 비운다
      queryClient.removeQueries({ predicate: (query) => !isMeQuery(query) })
      // 토큰은 HttpOnly 쿠키라 저장하지 않는다. 내 계정을 받아 와 로그인 상태로 만든다.
      await queryClient.query({ ...meQueryOptions, staleTime: 0 })
    },
  })
}
