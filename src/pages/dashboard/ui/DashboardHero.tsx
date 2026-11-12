import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/entities/session'
import { dashboardQueries } from '@/shared/api'
import { formatHHmm, formatKoreanLongDate } from '@/shared/lib/kst-date'

import { KpiCards } from './KpiCards'

// 160px 정사각형 노이즈 무늬(SVG feTurbulence)를 타일로 깐다
const GRAIN_IMAGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.26 0 0 0 0 0.72 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

/** 화면 맨 위의 요약. 인사말·기준 시각과 핵심 지표를 빛이 번지는 배경 위에 함께 둔다 */
export function DashboardHero() {
  const { me } = useSession()
  // 지표 카드와 같은 요약 query다. 같은 키라서 요청은 한 번만 나간다
  const { data: summary } = useQuery(dashboardQueries.summary())
  const lastSyncedAt = summary?.lastSyncedAt ?? null

  return (
    <div className="relative isolate flex flex-col gap-24pxr overflow-hidden rounded-panel bg-linear-to-br from-primary-100 via-card to-rose-100 p-28pxr">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-200pxr -left-80pxr size-448pxr animate-aurora rounded-full bg-primary-300/50 blur-3xl motion-reduce:animate-none" />
        <div className="absolute -right-40pxr -bottom-280pxr size-480pxr animate-aurora rounded-full bg-rose-200/70 blur-3xl [animation-delay:-6s] [animation-direction:alternate-reverse] motion-reduce:animate-none" />
        <div className="absolute -top-160pxr right-[25%] size-320pxr animate-aurora rounded-full bg-info-bg blur-3xl [animation-delay:-11s] motion-reduce:animate-none" />
        {/* 고운 입자를 덮어 그라데이션이 매끈한 화면 효과가 아니라 종이·분말 같은 질감으로 보이게 한다 */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply"
          style={{ backgroundImage: GRAIN_IMAGE }}
        />
      </div>

      <header className="flex flex-wrap items-end justify-between gap-12pxr">
        <div>
          {lastSyncedAt && (
            <p className="text-b2 font-bold text-primary">{formatKoreanLongDate(lastSyncedAt)}</p>
          )}
          <h1 className="text-h1 font-bold">안녕하세요{me && `, ${me.displayName}님`}</h1>
          <p className="text-b1 text-muted-foreground">
            오늘의 물류 흐름과 확인이 필요한 변화를 살펴보세요.
          </p>
        </div>
        {summary && (
          <p className="flex items-center gap-8pxr rounded-full border border-white bg-white/70 px-12pxr py-6pxr text-b2 text-muted-foreground backdrop-blur-md">
            {lastSyncedAt ? (
              <>
                <span className="relative flex size-8pxr" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                  <span className="relative size-8pxr rounded-full bg-success" />
                </span>
                마지막 업데이트 {formatHHmm(lastSyncedAt)} KST
              </>
            ) : (
              '수집된 데이터가 없습니다.'
            )}
          </p>
        )}
      </header>

      <KpiCards />
    </div>
  )
}
