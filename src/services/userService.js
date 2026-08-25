import { apiRequest } from './api.js'

export const getUsers = ({ page, limit, token, signal }) => {
  const params = new URLSearchParams({ page, limit })
  return apiRequest(`/api/auth/users?${params}`, { token, signal })
}
