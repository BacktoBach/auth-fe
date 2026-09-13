export const DEFAULT_TIMEOUT_MS = 30_000

let onUnauthorized = null

export class ApiError extends Error {
  constructor(message, status = 0, details = null, code = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.code = code
  }
}

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
  return () => {
    if (onUnauthorized === handler) onUnauthorized = null
  }
}

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()

  if (!text) return {}

  if (!contentType.includes('application/json')) return { message: text }

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('Phản hồi từ máy chủ không hợp lệ', response.status)
  }
}

const createRequestSignal = (externalSignal, timeoutMs) => {
  const controller = new AbortController()
  let timedOut = false
  const abortFromCaller = () => controller.abort(externalSignal.reason)

  if (externalSignal?.aborted) abortFromCaller()
  else externalSignal?.addEventListener('abort', abortFromCaller, { once: true })

  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      globalThis.clearTimeout(timeoutId)
      externalSignal?.removeEventListener('abort', abortFromCaller)
    },
  }
}

export const apiRequest = async (path, options = {}) => {
  const {
    method = 'GET',
    body,
    signal: externalSignal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    notifyUnauthorized = true,
  } = options
  const headers = body === undefined ? {} : { 'Content-Type': 'application/json' }
  const requestSignal = createRequestSignal(externalSignal, timeoutMs)

  try {
    const response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal: requestSignal.signal,
    })
    const data = await parseResponse(response)

    if (!response.ok) {
      const error = new ApiError(
        data.message || 'Yêu cầu không thành công',
        response.status,
        data,
      )
      if (response.status === 401 && notifyUnauthorized) onUnauthorized?.(error)
      throw error
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (requestSignal.didTimeout()) {
      throw new ApiError(
        'Máy chủ phản hồi quá lâu. Vui lòng thử lại.',
        0,
        null,
        'TIMEOUT',
      )
    }
    if (externalSignal?.aborted || error.name === 'AbortError') throw error
    throw new ApiError('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.')
  } finally {
    requestSignal.cleanup()
  }
}

export const checkHealth = (signal) => apiRequest('/health', {
  signal,
  notifyUnauthorized: false,
})
