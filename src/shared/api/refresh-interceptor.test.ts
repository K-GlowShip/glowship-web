import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { installRefreshInterceptor } from './refresh-interceptor'

interface Reply {
  status: number
  data?: unknown
  /** 응답을 이 약속이 풀릴 때까지 늦춘다 */
  wait?: Promise<void>
  /** true면 서버 응답 없이 네트워크 오류로 실패한다 */
  networkError?: boolean
}

/** 요청 경로별로 정해 둔 응답을 차례로 돌려주는 가짜 서버. 호출 기록도 남긴다 */
const setup = (replies: Record<string, Reply[]>) => {
  const calls: string[] = []
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? ''
    calls.push(url)
    const reply = replies[url]?.shift() ?? { status: 200 }
    await reply.wait
    if (reply.networkError) {
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)
    }
    const response = {
      status: reply.status,
      statusText: '',
      data: reply.data ?? null,
      headers: {},
      config,
    }
    if (reply.status >= 400) {
      throw new AxiosError('failed', String(reply.status), config, null, response)
    }
    return response
  }
  const instance: AxiosInstance = axios.create({ adapter })
  installRefreshInterceptor(instance)

  return { instance, calls, countOf: (url: string) => calls.filter((call) => call === url).length }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('installRefreshInterceptor', () => {
  it('401이면 재발급한 뒤 원래 요청을 다시 보내 그 응답을 돌려준다', async () => {
    const { instance, countOf } = setup({
      '/orders': [{ status: 401 }, { status: 200, data: 'ok' }],
      '/auth/refresh': [{ status: 204 }],
    })

    const response = await instance.get('/orders')

    expect(response.data).toBe('ok')
    expect(countOf('/auth/refresh')).toBe(1)
    expect(countOf('/orders')).toBe(2)
  })

  it('동시에 여러 요청이 401을 받아도 재발급은 한 번만 보낸다', async () => {
    const { instance, countOf } = setup({
      '/orders': [{ status: 401 }, { status: 200, data: 'a' }],
      '/skus': [{ status: 401 }, { status: 200, data: 'b' }],
      '/auth/refresh': [{ status: 204 }],
    })

    const [orders, skus] = await Promise.all([instance.get('/orders'), instance.get('/skus')])

    expect([orders.data, skus.data]).toEqual(['a', 'b'])
    expect(countOf('/auth/refresh')).toBe(1)
  })

  it('재발급이 끝나기 전에 보낸 요청의 뒤늦은 401은 재발급 없이 바로 다시 보낸다', async () => {
    let now = 1
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    let releaseSlow: () => void = () => undefined
    const { instance, calls, countOf } = setup({
      '/slow': [
        { status: 401, wait: new Promise<void>((resolve) => (releaseSlow = resolve)) },
        { status: 200, data: 'slow' },
      ],
      '/orders': [{ status: 401 }, { status: 200 }],
      '/auth/refresh': [{ status: 204 }],
    })

    // 시각 1에 보낸 느린 요청이 아직 돌아오지 않은 사이, 다른 요청이 401을 받아 재발급이 끝난다
    const slow = instance.get('/slow')
    // 요청 인터셉터는 다음 틱에 돌아서, 서버에 닿은 것을 확인한 뒤에 시각을 바꾼다
    await vi.waitFor(() => expect(calls).toEqual(['/slow']))
    now = 2
    await instance.get('/orders')
    expect(countOf('/auth/refresh')).toBe(1)

    now = 3
    releaseSlow()

    expect((await slow).data).toBe('slow')
    expect(countOf('/auth/refresh')).toBe(1)
    expect(countOf('/slow')).toBe(2)
  })

  it('재발급이 실패하면 원래 요청의 401을 그대로 던지고 다시 보내지 않는다', async () => {
    const { instance, countOf } = setup({
      '/orders': [{ status: 401 }],
      '/auth/refresh': [{ status: 401 }],
    })

    await expect(instance.get('/orders')).rejects.toMatchObject({
      config: { url: '/orders' },
      response: { status: 401 },
    })
    expect(countOf('/orders')).toBe(1)
  })

  it.each([401, 403])(
    '서버가 재발급을 거절하면(%i) 다음 로그인 전까지 다시 시도하지 않는다',
    async (status) => {
      const { instance, countOf } = setup({
        '/orders': [{ status: 401 }, { status: 401 }, { status: 200 }],
        '/skus': [{ status: 401 }],
        '/auth/login': [{ status: 200 }],
        '/auth/refresh': [{ status }, { status: 204 }],
      })

      await expect(instance.get('/orders')).rejects.toMatchObject({ response: { status: 401 } })
      await expect(instance.get('/skus')).rejects.toMatchObject({ response: { status: 401 } })
      expect(countOf('/auth/refresh')).toBe(1)

      // 다시 로그인하면 재발급을 다시 시도한다
      await instance.post('/auth/login')
      await expect(instance.get('/orders')).resolves.toMatchObject({ status: 200 })
      expect(countOf('/auth/refresh')).toBe(2)
    },
  )

  it('네트워크 오류로 재발급이 실패한 것은 거절이 아니라서 다음 401에서 다시 시도한다', async () => {
    const { instance, countOf } = setup({
      '/orders': [{ status: 401 }, { status: 401 }, { status: 200 }],
      '/auth/refresh': [{ status: 0, networkError: true }, { status: 204 }],
    })

    await expect(instance.get('/orders')).rejects.toMatchObject({ response: { status: 401 } })
    await expect(instance.get('/orders')).resolves.toMatchObject({ status: 200 })
    expect(countOf('/auth/refresh')).toBe(2)
  })

  it('다시 보낸 요청이 또 401이면 반복하지 않는다', async () => {
    const { instance, countOf } = setup({
      '/orders': [{ status: 401 }, { status: 401 }],
      '/auth/refresh': [{ status: 204 }],
    })

    await expect(instance.get('/orders')).rejects.toMatchObject({ response: { status: 401 } })
    expect(countOf('/auth/refresh')).toBe(1)
    expect(countOf('/orders')).toBe(2)
  })

  it.each(['/auth/login', '/auth/logout', '/auth/signup', '/auth/refresh'])(
    '%s 요청의 401은 재발급 대상이 아니다',
    async (url) => {
      const { instance, calls } = setup({ [url]: [{ status: 401 }] })

      await expect(instance.post(url)).rejects.toMatchObject({ response: { status: 401 } })
      expect(calls).toEqual([url])
    },
  )

  it('401이 아닌 오류는 건드리지 않는다', async () => {
    const { instance, calls } = setup({ '/orders': [{ status: 500 }] })

    await expect(instance.get('/orders')).rejects.toMatchObject({ response: { status: 500 } })
    expect(calls).toEqual(['/orders'])
  })

  it('재발급 뒤 다시 보내는 요청도 본문과 헤더를 그대로 유지한다', async () => {
    const seen = vi.fn()
    const { instance } = setup({
      '/final': [{ status: 401 }, { status: 200 }],
      '/auth/refresh': [{ status: 204 }],
    })
    instance.interceptors.request.use((config) => {
      if (config.url === '/final') {
        seen(config.headers.get('Idempotency-Key'), config.data)
      }
      return config
    })

    await instance.post(
      '/final',
      { reasonText: '이유' },
      { headers: { 'Idempotency-Key': 'key-1' } },
    )

    expect(seen).toHaveBeenCalledTimes(2)
    expect(seen).toHaveBeenNthCalledWith(1, 'key-1', { reasonText: '이유' })
    expect(seen.mock.calls[1][0]).toBe('key-1')
    expect(JSON.parse(seen.mock.calls[1][1] as string)).toEqual({ reasonText: '이유' })
  })
})
