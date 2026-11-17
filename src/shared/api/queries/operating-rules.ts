import { queryOptions } from '@tanstack/react-query'

import { getOperatingRuleSets } from '../endpoints/operating-rules'
import { LIST_STALE_TIME_MS } from './stale-time'

const OPERATING_RULES_KEY = 'operating-rule-sets'

export const operatingRuleQueries = {
  /** 새 버전을 저장한 뒤 목록을 다시 받을 때 쓰는 키 */
  listKey: () => [OPERATING_RULES_KEY, 'list'] as const,
  list: (companyId: string) =>
    queryOptions({
      queryKey: [OPERATING_RULES_KEY, 'list', companyId],
      queryFn: ({ signal }) => getOperatingRuleSets(companyId, { signal }),
      staleTime: LIST_STALE_TIME_MS,
    }),
}
