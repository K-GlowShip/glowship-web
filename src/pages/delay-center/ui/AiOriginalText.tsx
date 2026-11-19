import { ChevronDown } from 'lucide-react'

interface AiOriginalTextProps {
  /** AI(서버)가 쓴 원문. 라벨은 칸 이름이고 없으면 문장만 보여 준다 */
  items: { label?: string; text: string }[]
}

/**
 * AI 원문. 쉬운 문장은 같은 값으로 화면이 만든 것이라, 서버가 검증한 원문은 그 아래에 접어 두고 필요할 때만 펼친다.
 * 대응안 카드(선택용 라벨) 안에서 눌러도 대응안이 선택되지 않는다(펼침 요소는 라벨의 선택 동작을 일으키지 않는다).
 */
export function AiOriginalText({ items }: AiOriginalTextProps) {
  if (items.length === 0) {
    return null
  }
  return (
    <details className="group text-caption text-muted-foreground">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-4pxr rounded-control outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30 [&::-webkit-details-marker]:hidden">
        AI 원문 보기
        <ChevronDown
          className="size-14pxr transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      {/* 넓은 화면에서 한 줄이 너무 길어지지 않게 읽기 폭을 제한한다. 좁은 카드 안에서는 영향이 없다 */}
      <div className="mt-8pxr flex max-w-800pxr flex-col gap-6pxr break-keep">
        {items.map(({ label, text }, index) => (
          // 같은 문장이 여러 번 올 수 있어서 순서를 key에 섞는다
          <p key={`${index}-${text}`}>
            {label && <span className="font-bold text-foreground">{label} </span>}
            {text}
          </p>
        ))}
      </div>
    </details>
  )
}
