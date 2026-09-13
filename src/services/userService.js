import { apiRequest } from './api.js'

export const getUsers = ({ page, limit, search, signal }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const normalizedSearch = search?.trim()
  if (normalizedSearch) params.set('search', normalizedSearch)

  return apiRequest(`/api/auth/users?${params}`, { signal })
}
