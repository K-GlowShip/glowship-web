/** 목록 API 공통 응답. 서버 `Page[T]` (`items`·`page`·`size`·`totalCount`·`totalPages`) */
export interface Page<T> {
  items: T[]
  page: number
  size: number
  totalCount: number
  totalPages: number
}

export interface PageParams {
  /** 1부터 시작. 서버 기본값 1 */
  page?: number
  /** 서버 기본값 20, 최대 100 */
  size?: number
}
