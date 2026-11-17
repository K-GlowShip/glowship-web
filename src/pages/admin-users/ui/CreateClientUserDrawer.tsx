import type { CompanyOption } from '@/entities/session'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'

import { CreateClientUserForm } from './CreateClientUserForm'

interface CreateClientUserDrawerProps {
  company: CompanyOption
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}

/** 목록에서 고른 고객사에 팀장·팀원 계정을 만드는 드로어. 닫으면 폼의 입력과 결과가 사라진다 */
export function CreateClientUserDrawer({
  company,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: CreateClientUserDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-520pxr" onCloseAutoFocus={onCloseAutoFocus}>
        <DrawerHeader>
          <DrawerTitle>계정 만들기</DrawerTitle>
          <DrawerDescription>{company.companyName}에 팀장·팀원 계정을 만듭니다.</DrawerDescription>
        </DrawerHeader>
        <CreateClientUserForm companyId={company.companyId} />
      </DrawerContent>
    </Drawer>
  )
}
