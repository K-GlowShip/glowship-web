import { Sparkles } from 'lucide-react'

/** 설명 검증을 통과한 실행에서 1순위로 뽑힌 실행 가능한 대응안에 붙인다. */
export function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-4pxr rounded-full bg-primary-100 px-8pxr py-2pxr text-caption font-bold text-primary">
      <Sparkles className="size-12pxr" aria-hidden="true" />
      AI 추천
    </span>
  )
}
