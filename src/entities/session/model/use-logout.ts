import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { logout } from '@/shared/api'
import { ROUTES } from '@/shared/config'

import { clearSession, isDemoSession } from './session'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      // 데모 계정으로 로그인한 세션만 서버 세션이 없다. 데모 모드여도 실제 계정이면 서버에 알린다.
      if (isDemoSession()) {
        return
      }
      // HttpOnly 쿠키는 프론트가 지울 수 없어서 서버가 만료시킨다
      await logout()
    },
    onSuccess: () => {
      clearSession()
      queryClient.clear()
      navigate(ROUTES.LOGIN, { replace: true })
    },
  })
}
