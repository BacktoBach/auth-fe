import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../src/context/AuthContext.jsx'
import { useAuth } from '../../src/context/useAuth.js'
import {
  getCurrentUser,
  login as requestLogin,
  logout as requestLogout,
} from '../../src/services/authService.js'

vi.mock('../../src/services/authService.js', () => ({
  changePassword: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}))

const sessionResponse = {
  user: { id: '1', name: 'Test User', email: 'user@example.com', role: 'user' },
  session: { expiresAt: new Date(Date.now() + 60_000).toISOString() },
}

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    getCurrentUser.mockReset()
    requestLogin.mockReset()
    requestLogout.mockReset()
  })

  it('restores a cookie session through /me', async () => {
    getCurrentUser.mockResolvedValue(sessionResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.initializing).toBe(false))
    expect(result.current.user).toEqual(sessionResponse.user)
    expect(result.current.expiresAt).toBe(sessionResponse.session.expiresAt)
    expect(getCurrentUser).toHaveBeenCalledWith(expect.objectContaining({
      notifyUnauthorized: false,
    }))
  })

  it('treats an initial 401 as a normal guest session', async () => {
    getCurrentUser.mockRejectedValue({ status: 401 })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.initializing).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.sessionExpired).toBe(false)
  })

  it('logs in without storing a JWT in Web Storage', async () => {
    getCurrentUser.mockRejectedValue({ status: 401 })
    requestLogin.mockResolvedValue(sessionResponse)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.initializing).toBe(false))

    await act(async () => {
      await result.current.login({
        email: 'user@example.com',
        password: 'Password123',
      }, true)
    })

    expect(requestLogin).toHaveBeenCalledWith(expect.objectContaining({ remember: true }))
    expect(result.current.user).toEqual(sessionResponse.user)
    expect(localStorage.getItem('jwt-auth-session')).toBeNull()
    expect(sessionStorage.length).toBe(0)
    expect(localStorage.getItem('auth-sync-event')).not.toContain('Password123')
  })

  it('clears local auth state even when logout fails', async () => {
    getCurrentUser.mockResolvedValue(sessionResponse)
    requestLogout.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(sessionResponse.user))

    let logoutError
    await act(async () => {
      try {
        await result.current.logout()
      } catch (error) {
        logoutError = error
      }
    })
    expect(logoutError).toMatchObject({ message: 'offline' })
    expect(result.current.user).toBeNull()
  })
})
