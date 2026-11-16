import type { Page } from './page'

/** 서버가 한 번에 주는 최대 수(명세 D11) */
export const MAX_PAGE_SIZE = 100

/** 한 번에 받는 최대 페이지 수. 목록이 이보다 크면 앞쪽만 받고 `totalCount`로 부족함을 알린다 */
const MAX_FETCHED_PAGES = 10

/**
 * 목록의 모든 페이지를 받아 하나로 합친다. 첫 페이지로 전체 쪽 수를 알고 나머지는 한꺼번에 요청한다.
 * 쪽 수가 `MAX_FETCHED_PAGES`를 넘으면 그만큼만 받고, `totalCount`는 서버 값 그대로 둬서 호출한 쪽이 다 받았는지 비교할 수 있다.
 */
export const fetchAllPages = async <T>(
  fetchPage: (page: number) => Promise<Page<T>>,
): Promise<Page<T>> => {
  const first = await fetchPage(1)
  const lastPage = Math.min(first.totalPages, MAX_FETCHED_PAGES)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, lastPage - 1) }, (_, index) => fetchPage(index + 2)),
  )

  return { ...first, items: [first, ...rest].flatMap((page) => page.items) }
}
