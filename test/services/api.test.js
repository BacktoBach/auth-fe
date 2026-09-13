import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, setUnauthorizedHandler } from '../../src/services/api.js'

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    setUnauthorizedHandler(null)
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('uses same-origin paths and always includes credentials', async () => {
    fetch.mockResolvedValue(jsonResponse({ statusCode: 200 }))

    await apiRequest('/api/auth/me')

    expect(fetch).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({
      credentials: 'include',
    }))
  })

  it('parses empty and text responses', async () => {
    fetch
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response('ready', { status: 200 }))

    await expect(apiRequest('/empty')).resolves.toEqual({})
    await expect(apiRequest('/text')).resolves.toEqual({ message: 'ready' })
  })

  it('rejects malformed JSON as an ApiError', async () => {
    fetch.mockResolvedValue(new Response('{bad', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(apiRequest('/broken')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Phản hồi từ máy chủ không hợp lệ',
    })
  })

  it('notifies global auth handling only when enabled', async () => {
    const unauthorized = vi.fn()
    setUnauthorizedHandler(unauthorized)
    fetch.mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, 401))

    await expect(apiRequest('/protected')).rejects.toBeInstanceOf(ApiError)
    expect(unauthorized).toHaveBeenCalledOnce()

    await expect(apiRequest('/login', { notifyUnauthorized: false })).rejects.toBeInstanceOf(ApiError)
    expect(unauthorized).toHaveBeenCalledOnce()
  })

  it('distinguishes timeout from a caller abort', async () => {
    vi.useFakeTimers()
    fetch.mockImplementation((_path, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))

    const timeoutRequest = apiRequest('/slow', { timeoutMs: 100 })
    const timeoutAssertion = expect(timeoutRequest).rejects.toMatchObject({ code: 'TIMEOUT' })
    await vi.advanceTimersByTimeAsync(100)
    await timeoutAssertion

    const controller = new AbortController()
    const abortedRequest = apiRequest('/cancelled', { signal: controller.signal })
    const abortAssertion = expect(abortedRequest).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await abortAssertion
  })
})
