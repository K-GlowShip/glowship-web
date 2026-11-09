import { useState } from 'react'

/** 서버의 `size` 기본값과 같다 */
export const SYNC_DATA_PAGE_SIZE = 20

/**
 * 연동 데이터 탭의 검색어·페이지 상태. 입력 중인 검색어(`input`)는 "조회"를 눌러야 요청에 쓰고,
 * 조회하면 1페이지로 돌아간다. 입력할 때마다 요청하지 않으려는 것이다.
 * 조건이 그대로(같은 검색어, 1페이지)면 상태가 바뀌지 않아 요청이 나가지 않으므로, 넘겨받은 `refetch`로 새로 받는다.
 * 서버는 `q`가 비어 있으면 없는 것으로 보지만, 요청에 빈 값이 실리지 않게 `undefined`로 바꾼다.
 */
export function useListParams() {
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const onSubmit = (refetch: () => unknown) => {
    const next = input.trim()
    if (next === keyword && page === 1) {
      void refetch()
      return
    }
    setKeyword(next)
    setPage(1)
  }

  return {
    input,
    onInputChange: setInput,
    onSubmit,
    page,
    onPageChange: setPage,
    params: { q: keyword || undefined, page, size: SYNC_DATA_PAGE_SIZE },
  }
}
