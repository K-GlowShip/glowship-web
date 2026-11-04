import { ChevronLeft } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'

import { DELAY_EVENT_ID_PARAM, ROUTES } from '@/shared/config'

import { getListSearch } from '../model/delay-center'
import { CURRENT_ROLE, DELAY_CASES } from '../model/delay-center-mock'
import { DelayDetail } from './DelayDetail'

/** 지연 건 하나의 상세 화면. 목록에서 들어왔으면 '목록으로'가 그 목록의 검색 조건을 되살린다. */
export function DelayDetailPage() {
  const delayEventId = useParams()[DELAY_EVENT_ID_PARAM]
  const { state } = useLocation()
  const listSearch = getListSearch(state)

  // TODO: GET /delay-events/{delayEventId} 연동. 없는 건이나 다른 고객사 건은 404(DELAY_EVENT_NOT_FOUND)로 온다
  const delayCase = DELAY_CASES.find(({ id }) => id === delayEventId)

  return (
    <div className="flex flex-col gap-16pxr">
      <Link
        to={{ pathname: ROUTES.DELAY_CENTER, search: listSearch }}
        className="flex w-fit items-center gap-4pxr rounded-card text-b1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/30"
      >
        <ChevronLeft className="size-18pxr" aria-hidden="true" />
        목록으로
      </Link>

      {delayCase ? (
        <DelayDetail key={delayCase.id} delayCase={delayCase} role={CURRENT_ROLE} />
      ) : (
        <p className="rounded-panel border border-border bg-card px-32pxr py-80pxr text-center text-b1 text-muted-foreground">
          지연 건을 찾을 수 없습니다.
        </p>
      )}
    </div>
  )
}
