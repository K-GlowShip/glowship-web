import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { type ApiError, createClientUser, type CreatedClientUser } from '@/shared/api'
import { encodeBase64 } from '@/shared/lib/encode-base64'

import { type ClientUserFormValues, normalizeClientUserValues } from './validate-client-user'

interface CreateClientUserVariables {
  companyId: string
  values: ClientUserFormValues
}

/**
 * 고객사 계정 생성(`POST /admin/users`). 입력한 값을 서버 요청 형식으로 바꾼다: 이메일·이름은 앞뒤 공백을 빼고,
 * 비밀번호는 Base64로 인코딩한다. 이름은 폼이 필수로 받는다.
 * 오류는 폼이 칸마다 보여 주고, 세션이 끝난 오류(401)는 전역 처리가 맡는다.
 * 요청 중 상태(`isPending`)는 다음 렌더에야 바뀌어서 같은 틱에 연달아 부르면 계정이 두 번 만들어질 수 있으므로, 요청 중이면 무시한다.
 */
export const useCreateClientUser = () => {
  const isRequested = useRef(false)

  const mutation = useMutation<CreatedClientUser, ApiError, CreateClientUserVariables>({
    mutationFn: ({ companyId, values }) => {
      const { email, password, roleCode, displayName } = normalizeClientUserValues(values)
      return createClientUser({
        companyId,
        email,
        password: encodeBase64(password),
        roleCode,
        displayName,
      })
    },
  })

  const create: typeof mutation.mutate = (variables, options) => {
    if (isRequested.current) {
      return
    }
    isRequested.current = true
    mutation.mutate(variables, {
      ...options,
      onSettled: (...args) => {
        isRequested.current = false
        options?.onSettled?.(...args)
      },
    })
  }

  return { ...mutation, mutate: create }
}
