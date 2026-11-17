import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  type ApiError,
  createOperatingRuleSet,
  type CreatedOperatingRuleSet,
  type CreateOperatingRuleSetRequest,
  operatingRuleQueries,
} from '@/shared/api'

/** 운영 기준 새 버전 저장(`POST /admin/operating-rule-sets`). 저장하고 나면 버전 목록을 다시 받는다 */
export const useCreateOperatingRuleSet = () => {
  const queryClient = useQueryClient()

  return useMutation<CreatedOperatingRuleSet, ApiError, CreateOperatingRuleSetRequest>({
    mutationFn: createOperatingRuleSet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: operatingRuleQueries.listKey() }),
  })
}
