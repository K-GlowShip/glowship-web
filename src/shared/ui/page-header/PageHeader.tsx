import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  /** 제목 오른쪽에 두는 것. 예: 화면이 다루는 고객사 선택 */
  children?: ReactNode
}

/** 화면 맨 위의 제목 줄. 좁은 화면에서는 오른쪽 내용이 제목 아래로 내려간다 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-24pxr gap-y-12pxr">
      <div>
        <h1 className="text-h1 font-bold">{title}</h1>
        <p className="text-b1 text-muted-foreground">{description}</p>
      </div>
      {children}
    </header>
  )
}
