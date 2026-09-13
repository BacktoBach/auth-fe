import { apiRequest } from './api.js'

export const register = (payload) => apiRequest('/api/auth/register', {
  method: 'POST',
  body: payload,
  notifyUnauthorized: false,
})

export const login = (payload) => apiRequest('/api/auth/login', {
  method: 'POST',
  body: payload,
  notifyUnauthorized: false,
})

export const getCurrentUser = ({ signal, notifyUnauthorized = true } = {}) => (
  apiRequest('/api/auth/me', { signal, notifyUnauthorized })
)

export const changePassword = (payload) => apiRequest('/api/auth/change-password', {
  method: 'PUT',
  body: payload,
})

export const logout = () => apiRequest('/api/auth/logout', {
  method: 'POST',
  notifyUnauthorized: false,
})
