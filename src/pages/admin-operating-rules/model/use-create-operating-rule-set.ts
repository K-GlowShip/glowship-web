import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  type ApiError,
  createOperatingRuleSet,
  type CreatedOperatingRuleSet,
  type CreateOperatingRuleSetRequest,
  operatingRuleQueries,
} from '@/shared/api'
import { useSingleFlightMutate } from '@/shared/lib/use-single-flight-mutate'

/**
 * 운영 기준 새 버전 저장(`POST /admin/operating-rule-sets`). 저장하고 나면 버전 목록을 다시 받는다.
 * 저장은 되돌릴 수 없어서, 같은 틱에 연달아 불러도 버전이 두 개 만들어지지 않게 요청 중이면 무시한다.
 */
export const useCreateOperatingRuleSet = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<CreatedOperatingRuleSet, ApiError, CreateOperatingRuleSetRequest>({
    mutationFn: createOperatingRuleSet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: operatingRuleQueries.listKey() }),
  })

  return { ...mutation, mutate: useSingleFlightMutate(mutation.mutate) }
}
