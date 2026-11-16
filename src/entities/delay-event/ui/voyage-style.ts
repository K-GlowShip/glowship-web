import { Package, Plane, Ship, type LucideIcon } from 'lucide-react'

import { TRANSPORT_MODE, type TransportMode } from '../model/route'

export interface VoyageStyle {
  Icon: LucideIcon
  /** 현재 정거장의 아이콘 원 */
  marker: string
  /** 지나온 구간의 선. 시작 쪽이 반투명이라 아래에 깔린 점선이 은은하게 비친다 */
  fill: string
  /** 지나온 정거장의 점 */
  dot: string
  /** 운송 수단 이름표와 운송 단계 글자 */
  chip: string
  text: string
}

// 해상은 파랑, 항공은 보라. 색을 못 가려도 아이콘과 이름표('해상'·'항공')로 구분된다
const VOYAGE_STYLE: Record<TransportMode, VoyageStyle> = {
  [TRANSPORT_MODE.OCEAN]: {
    Icon: Ship,
    marker: 'bg-info shadow-[0_0.25rem_0.75rem_-0.25rem_rgb(38_94_168/0.7)]',
    fill: 'from-info/30 to-info',
    dot: 'bg-info',
    chip: 'bg-info-bg text-info',
    text: 'text-info',
  },
  [TRANSPORT_MODE.AIR]: {
    Icon: Plane,
    marker: 'bg-primary shadow-[0_0.25rem_0.75rem_-0.25rem_rgb(89_67_184/0.7)]',
    fill: 'from-primary/30 to-primary',
    dot: 'bg-primary',
    chip: 'bg-primary-100 text-primary',
    text: 'text-primary',
  },
}

/** 서버가 새 운송 수단을 추가해 알 수 없을 때 */
const UNKNOWN_VOYAGE_STYLE: VoyageStyle = { ...VOYAGE_STYLE[TRANSPORT_MODE.AIR], Icon: Package }

/** 운송 수단에 맞는 아이콘과 색 */
export const getVoyageStyle = (transportMode: string) =>
  VOYAGE_STYLE[transportMode as TransportMode] ?? UNKNOWN_VOYAGE_STYLE
