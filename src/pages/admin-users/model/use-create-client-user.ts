import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  adminUserQueries,
  type ApiError,
  createClientUser,
  type CreatedClientUser,
} from '@/shared/api'
import { encodeBase64 } from '@/shared/lib/encode-base64'
import { useSingleFlightMutate } from '@/shared/lib/use-single-flight-mutate'

import { type ClientUserFormValues, normalizeClientUserValues } from './validate-client-user'

interface CreateClientUserVariables {
  companyId: string
  values: ClientUserFormValues
}

/**
 * 고객사 계정 생성(`POST /admin/users`). 입력한 값을 서버 요청 형식으로 바꾼다: 이메일·이름은 앞뒤 공백을 빼고,
 * 비밀번호는 Base64로 인코딩한다. 이름은 폼이 필수로 받는다.
 * 만들고 나면 계정 목록을 다시 받는다. 오류는 폼이 칸마다 보여 주고, 세션이 끝난 오류(401)는 전역 처리가 맡는다.
 * 같은 틱에 연달아 불러도 계정이 두 번 만들어지지 않게, 요청 중이면 무시한다(`useSingleFlightMutate`).
 */
export const useCreateClientUser = () => {
  const queryClient = useQueryClient()

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
    // 새 계정이 목록에 바로 보이도록 목록을 다시 받는다
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserQueries.listKey() }),
  })

  return { ...mutation, mutate: useSingleFlightMutate(mutation.mutate) }
}
