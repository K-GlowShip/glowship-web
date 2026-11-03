import { useRef, useState } from 'react'

/**
 * 행을 눌러 상세(모달·드로어)를 여는 화면의 공통 상태.
 * 닫힘 애니메이션 동안 내용이 사라지지 않도록 선택한 항목은 닫아도 그대로 두고, 열림 여부만 따로 바꾼다.
 * 트리거(DialogTrigger) 없이 `open`만 제어해서 Radix가 포커스를 돌려줄 대상을 모르므로,
 * 열 때 포커스가 있던 요소를 기억해 두었다가 닫힌 뒤 `onCloseAutoFocus`로 되돌려 준다.
 */
export function useDetailDialog<T>() {
  const [selected, setSelected] = useState<T | null>(null)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)

  const show = (item: T) => {
    triggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSelected(item)
    setOpen(true)
  }

  const onCloseAutoFocus = (event: Event) => {
    const trigger = triggerRef.current
    if (trigger?.isConnected) {
      event.preventDefault()
      trigger.focus({ preventScroll: true })
    }
  }

  return { selected, open, onOpenChange: setOpen, onCloseAutoFocus, show }
}
