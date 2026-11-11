import type { ReactNode } from 'react'

interface DetailChapterProps {
  /** 제목 요소의 id. 영역 이름으로 읽힌다 */
  id: string
  /** 읽는 순서를 알려 주는 번호. 예: '01' */
  step: string
  title: string
  /** 이 영역에서 무엇을 하는지 알려 주는 한 줄 */
  description?: string
  children: ReactNode
}

/**
 * 지연 상세의 큰 영역 하나(현재 상황 → 대응안 → 선택). 번호와 제목으로 읽는 순서를 드러내고,
 * 안쪽 내용은 상자를 더 만들지 않고 가는 선과 여백으로만 나눈다.
 */
export function DetailChapter({ id, step, title, description, children }: DetailChapterProps) {
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-24pxr rounded-panel border border-border bg-card p-32pxr"
    >
      <header className="flex flex-wrap items-baseline gap-x-12pxr gap-y-4pxr">
        <span className="text-h2 font-light text-primary tabular-nums" aria-hidden="true">
          {step}
        </span>
        <h3 id={id} className="text-h2 font-bold">
          {title}
        </h3>
        {description && <p className="text-b2 text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}

interface DetailSubsectionProps {
  /** 제목 요소의 id */
  id: string
  title: ReactNode
  /** 제목 옆에 흐리게 두는 보조 설명 */
  aside?: ReactNode
  children: ReactNode
}

/** 영역 안의 한 묶음. 제목 크기를 통일하고 묶음 사이를 가는 선으로 나눠서, 영역 → 묶음 → 내용의 단계가 보이게 한다. */
export function DetailSubsection({ id, title, aside, children }: DetailSubsectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-16pxr border-t border-border pt-24pxr first-of-type:border-t-0 first-of-type:pt-0"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-16pxr gap-y-4pxr">
        <h4 id={id} className="text-h3 font-bold">
          {title}
        </h4>
        {aside && <p className="text-b2 text-muted-foreground">{aside}</p>}
      </div>
      {children}
    </section>
  )
}
