import { describe, expect, it, vi } from 'vitest'

import { fetchAllPages } from './fetch-all-pages'
import type { Page } from './page'

const pageOf = (page: number, totalCount: number, size = 2): Page<number> => {
  const totalPages = Math.ceil(totalCount / size)
  const start = (page - 1) * size

  return {
    items: Array.from(
      { length: Math.max(0, Math.min(size, totalCount - start)) },
      (_, i) => start + i,
    ),
    page,
    size,
    totalCount,
    totalPages,
  }
}

describe('fetchAllPages', () => {
  it('한 페이지면 한 번만 요청한다', async () => {
    const fetchPage = vi.fn(async (page: number) => pageOf(page, 2))

    expect((await fetchAllPages(fetchPage)).items).toEqual([0, 1])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('여러 페이지를 순서대로 합친다', async () => {
    const fetchPage = vi.fn(async (page: number) => pageOf(page, 5))
    const result = await fetchAllPages(fetchPage)

    expect(result.items).toEqual([0, 1, 2, 3, 4])
    expect(result.totalCount).toBe(5)
    expect(fetchPage).toHaveBeenCalledTimes(3)
  })

  it('비어 있으면 빈 목록이다', async () => {
    expect((await fetchAllPages(async (page) => pageOf(page, 0))).items).toEqual([])
  })

  it('쪽 수가 너무 많으면 앞쪽만 받고 totalCount는 서버 값을 둔다', async () => {
    const fetchPage = vi.fn(async (page: number) => pageOf(page, 100, 1))
    const result = await fetchAllPages(fetchPage)

    expect(fetchPage).toHaveBeenCalledTimes(10)
    expect(result.items).toHaveLength(10)
    expect(result.totalCount).toBe(100)
  })
})
