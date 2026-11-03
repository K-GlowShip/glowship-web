export type PageItem = number | 'ellipsis'

const VISIBLE_PAGES = 3

/** 현재 페이지 주변 3개와 처음·끝 페이지를 보여주고, 건너뛴 구간은 'ellipsis'로 표시한다. */
export const getPageItems = (page: number, pageCount: number): PageItem[] => {
  if (pageCount <= VISIBLE_PAGES + 2) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const start = Math.min(Math.max(page - 1, 1), pageCount - VISIBLE_PAGES + 1)
  const end = start + VISIBLE_PAGES - 1
  const items: PageItem[] = []

  if (start > 1) {
    items.push(1)
  }
  if (start > 2) {
    items.push('ellipsis')
  }
  for (let current = start; current <= end; current += 1) {
    items.push(current)
  }
  if (end < pageCount - 1) {
    items.push('ellipsis')
  }
  if (end < pageCount) {
    items.push(pageCount)
  }

  return items
}
