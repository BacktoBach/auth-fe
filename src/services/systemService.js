import { apiRequest } from './api.js'

export const systemService = {
  getHealth: (signal) => apiRequest('/health', { signal }),
}
