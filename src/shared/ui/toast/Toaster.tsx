import { Toaster as Sonner } from 'sonner'

/**
 * 앱 루트에 한 번 둔다. 알림 내용은 `toastError`처럼 이 폴더의 함수로 띄운다.
 * sonner는 위치·쌓임·자동 닫힘·스크린리더용 알림 영역(aria-live)만 맡고, 모양은 직접 그린다.
 */
export function Toaster() {
  return <Sonner position="top-center" />
}
