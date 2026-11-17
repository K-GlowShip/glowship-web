import type { AssignedCompany } from '@/shared/api'

import { useSession } from './session'

const NO_COMPANIES: AssignedCompany[] = []

/**
 * 내가 고를 수 있는 고객사 목록(`GET /me`의 `assignedCompanies[]`).
 * 관리자는 담당 고객사, 오너는 전체 고객사다. 아직 불러오지 못했거나 담당이 없으면 빈 목록이다.
 */
export const useAssignedCompanies = (): AssignedCompany[] =>
  useSession().me?.assignedCompanies ?? NO_COMPANIES
