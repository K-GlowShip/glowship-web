import { HeroRouteContent } from './HeroRouteContent'
import { KpiCards } from './KpiCards'

// 160px 정사각형 노이즈 무늬(SVG feTurbulence)를 타일로 깐다
const GRAIN_IMAGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.26 0 0 0 0 0.72 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

/**
 * 화면 맨 위의 요약. 라벤더·로즈·하늘색 빛이 천천히 흐르는 오로라 면 위에 오늘 상황 한 문장, 양식화된 항로 지도,
 * 운송 수단별 건수 범례, 핵심 지표를 함께 둔다
 */
export function DashboardHero() {
  return (
    <section
      aria-label="오늘의 요약"
      className="@container relative isolate overflow-hidden rounded-panel bg-linear-to-br from-primary-100 via-card to-rose-100"
    >
      {/* 오로라: 블롭 세 개가 천천히 흐르고 그 위를 고운 입자가 덮는다. 지도(-z-10)보다 뒤(-z-20)에 둔다 */}
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div className="absolute -top-200pxr -left-80pxr size-448pxr animate-aurora rounded-full bg-primary-300/50 blur-3xl motion-reduce:animate-none" />
        <div className="absolute -right-40pxr -bottom-280pxr size-480pxr animate-aurora rounded-full bg-rose-200/70 blur-3xl [animation-delay:-6s] [animation-direction:alternate-reverse] motion-reduce:animate-none" />
        <div className="absolute -top-160pxr right-[25%] size-320pxr animate-aurora rounded-full bg-info-bg blur-3xl [animation-delay:-11s] motion-reduce:animate-none" />
        {/* 고운 입자를 덮어 그라데이션이 매끈한 화면 효과가 아니라 종이·분말 같은 질감으로 보이게 한다 */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply"
          style={{ backgroundImage: GRAIN_IMAGE }}
        />
      </div>
      <HeroRouteContent />
      <div className="px-32pxr pb-32pxr">
        <KpiCards />
      </div>
    </section>
  )
}
