const DEFAULT_API_URL = 'https://auth-api-jne3.onrender.com'

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()

  const text = await response.text()
  return text ? { message: text } : {}
}

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, token, signal } = options
  const headers = {}

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.')
  }

  const data = await parseResponse(response)
  if (!response.ok) {
    throw new ApiError(data.message || 'Yêu cầu không thành công', response.status, data)
  }

  return data
}

export const authApi = {
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: payload }),
  me: (token, signal) => apiRequest('/api/auth/me', { token, signal }),
  changePassword: (payload, token) => apiRequest('/api/auth/change-password', {
    method: 'PUT',
    body: payload,
    token,
  }),
  logout: (token) => apiRequest('/api/auth/logout', { method: 'POST', token }),
  users: ({ page, limit, token, signal }) => apiRequest(
    `/api/auth/users?page=${page}&limit=${limit}`,
    { token, signal },
  ),
  health: (signal) => apiRequest('/health', { signal }),
}
