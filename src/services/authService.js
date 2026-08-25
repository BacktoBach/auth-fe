import { apiRequest } from './api.js'

export const register = (payload) => apiRequest('/api/auth/register', {
  method: 'POST',
  body: payload,
})

export const login = (payload) => apiRequest('/api/auth/login', {
  method: 'POST',
  body: payload,
})

export const getCurrentUser = (token, signal) => apiRequest('/api/auth/me', {
  token,
  signal,
})

export const changePassword = (payload, token) => apiRequest('/api/auth/change-password', {
  method: 'PUT',
  body: payload,
  token,
})

export const logout = (token) => apiRequest('/api/auth/logout', {
  method: 'POST',
  token,
})
