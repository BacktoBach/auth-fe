import { apiRequest } from './api.js'

export const authService = {
  register: (payload) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  }),

  login: (payload) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
  }),

  getCurrentUser: (token, signal) => apiRequest('/api/auth/me', {
    token,
    signal,
  }),

  changePassword: (payload, token) => apiRequest('/api/auth/change-password', {
    method: 'PUT',
    body: payload,
    token,
  }),

  logout: (token) => apiRequest('/api/auth/logout', {
    method: 'POST',
    token,
  }),
}
