import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { isApiError } from './error'
import { API, fetcher } from './fetcher'

/**
 * 실제 `fetcher`에 가짜 서버를 끼워서, 재발급 인터셉터가 오류를 `ApiError`로 바꾸는 인터셉터보다 먼저 등록돼 있는지 확인한다.
 * 순서가 바뀌면 재발급이 요청 설정을 읽지 못해 아래 첫 번째 테스트가 실패한다.
 */
const originalAdapter = fetcher.defaults.adapter

const fakeServer = (statuses: Record<string, number[]>) => {
  const calls: string[] = []
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? ''
    calls.push(url)
    const status = statuses[url]?.shift() ?? 200
    const response = { status, statusText: '', data: { ok: status < 400 }, headers: {}, config }
    if (status >= 400) {
      throw new AxiosError('failed', String(status), config, null, {
        ...response,
        data: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.', request_id: 'r1' },
      })
    }
    return response
  }
  fetcher.defaults.adapter = adapter
  return calls
}

beforeEach(() => {
  fetcher.defaults.adapter = originalAdapter
})

afterEach(() => {
  fetcher.defaults.adapter = originalAdapter
})

describe('fetcher의 토큰 재발급', () => {
  it('401이면 재발급한 뒤 원래 요청을 다시 보내 성공한다', async () => {
    const calls = fakeServer({ '/v1/orders': [401, 200], '/v1/auth/refresh': [204] })

    await expect(API.get('/orders')).resolves.toEqual({ ok: true })
    expect(calls).toEqual(['/v1/orders', '/v1/auth/refresh', '/v1/orders'])
  })

  it('재발급이 거절되면 원래 요청의 401이 ApiError로 던져진다', async () => {
    fakeServer({ '/v1/skus': [401], '/v1/auth/refresh': [401] })

    const error = await API.get('/skus').catch((caught: unknown) => caught)

    expect(isApiError(error)).toBe(true)
    expect(error).toMatchObject({ status: 401, code: 'UNAUTHENTICATED' })
  })
})
