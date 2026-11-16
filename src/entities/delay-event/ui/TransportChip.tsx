import { cn } from '@/shared/lib/cn'

import { TRANSPORT_MODE_LABEL, type TransportMode } from '../model/route'
import { getVoyageStyle } from './voyage-style'

/** 운송 수단 이름표(해상·항공). 색과 글자가 함께 구분해서 색을 못 가려도 알 수 있다. 모르는 운송 수단이면 그리지 않는다 */
export function TransportChip({ transportMode }: { transportMode: string }) {
  const label = TRANSPORT_MODE_LABEL[transportMode as TransportMode]

  if (!label) {
    return null
  }
  return (
    <span className={cn('rounded-full px-8pxr font-bold', getVoyageStyle(transportMode).chip)}>
      {label}
    </span>
  )
}
