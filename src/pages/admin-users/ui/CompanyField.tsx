import { useId } from 'react'

import type { AssignedCompany } from '@/shared/api'
import { Dropdown } from '@/shared/ui/dropdown'

export type CompanyOption = Pick<AssignedCompany, 'companyId' | 'companyName'>

interface CompanyFieldProps {
  /** 비어 있지 않은 목록. 하나뿐이면 고를 필요가 없어서 이름만 보여 준다 */
  companies: [CompanyOption, ...CompanyOption[]]
  value: string
  onChange: (companyId: string) => void
}

/** 계정을 만들 고객사. 고객사가 여럿이면 선택 상자, 하나면 이름만 보여 준다 */
export function CompanyField({ companies, value, onChange }: CompanyFieldProps) {
  const labelId = useId()

  return (
    <div className="flex flex-col gap-4pxr">
      <p id={labelId} className="text-b2 font-bold text-foreground">
        고객사
      </p>
      {companies.length > 1 ? (
        <Dropdown
          aria-labelledby={labelId}
          options={companies.map(({ companyId, companyName }) => ({
            value: companyId,
            label: companyName,
          }))}
          value={value}
          onChange={onChange}
        />
      ) : (
        <p className="text-b1 text-foreground">{companies[0].companyName}</p>
      )}
    </div>
  )
}
