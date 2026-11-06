import { toast } from 'sonner'

import { ErrorToast } from './ErrorToast'

/** 오류 알림을 띄운다. 오른쪽 X로 닫을 수 있고 잠시 뒤 자동으로 사라진다. */
export const toastError = (message: string) =>
  toast.custom((id) => <ErrorToast id={id} message={message} />)
