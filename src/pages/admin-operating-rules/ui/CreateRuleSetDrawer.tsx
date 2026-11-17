import type { CompanyOption } from '@/entities/session'
import type { OperatingRuleSet } from '@/shared/api'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'

import { RuleSetForm } from './RuleSetForm'

interface CreateRuleSetDrawerProps {
  company: CompanyOption
  base: OperatingRuleSet | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}

/** 운영 기준 새 버전을 저장하는 드로어. 저장하면 닫히고, 닫으면 입력한 값이 사라진다 */
export function CreateRuleSetDrawer({
  company,
  base,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: CreateRuleSetDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-520pxr" onCloseAutoFocus={onCloseAutoFocus}>
        <DrawerHeader>
          <DrawerTitle>운영 기준 새 버전</DrawerTitle>
          <DrawerDescription>
            {company.companyName}의 {base ? `v${base.versionNo}` : '운영 기준'} 값을 바탕으로
            만듭니다.
          </DrawerDescription>
        </DrawerHeader>
        <RuleSetForm
          companyId={company.companyId}
          base={base}
          onSaved={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  )
}
