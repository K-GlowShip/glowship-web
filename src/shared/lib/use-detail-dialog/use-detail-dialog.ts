import { useState } from 'react'

/**
 * 행을 눌러 상세(모달·드로어)를 여는 화면의 공통 상태.
 * 닫힘 애니메이션 동안 내용이 사라지지 않도록 선택한 항목은 닫아도 그대로 두고, 열림 여부만 따로 바꾼다.
 */
export function useDetailDialog<T>() {
  const [selected, setSelected] = useState<T | null>(null)
  const [open, setOpen] = useState(false)

  const show = (item: T) => {
    setSelected(item)
    setOpen(true)
  }

  return { selected, open, onOpenChange: setOpen, show }
}
