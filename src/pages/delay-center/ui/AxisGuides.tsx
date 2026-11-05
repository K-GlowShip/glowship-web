import { cn } from '@/shared/lib/cn'

interface AxisGuidesProps {
  /** 점선을 그을 위치(0~100). 계획·예상 입고일이다. */
  guides: number[]
  className?: string
}

/** 계획·예상 입고일에서 세로로 내리는 점선. 줄마다 자기 높이만큼 그려서 위아래로 이어 보이게 한다. */
export function AxisGuides({ guides, className }: AxisGuidesProps) {
  return guides.map((left) => (
    <span
      key={left}
      className={cn('absolute inset-y-0 border-l border-dashed border-border', className)}
      style={{ left: `${left}%` }}
    />
  ))
}
