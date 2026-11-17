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

/** 화면이 다루는 고객사. 이름표와 값을 한 줄에 두고, 고객사가 여럿이면 선택 상자, 하나면 이름만 보여 준다 */
export function CompanyField({ companies, value, onChange }: CompanyFieldProps) {
  const labelId = useId()

  return (
    <div className="flex items-center gap-12pxr">
      <p id={labelId} className="shrink-0 text-b2 text-muted-foreground">
        고객사
      </p>
      {companies.length > 1 ? (
        <Dropdown
          aria-labelledby={labelId}
          className="w-220pxr"
          options={companies.map(({ companyId, companyName }) => ({
            value: companyId,
            label: companyName,
          }))}
          value={value}
          onChange={onChange}
        />
      ) : (
        <p className="text-b1 font-bold text-foreground">{companies[0].companyName}</p>
      )}
    </div>
  )
}
