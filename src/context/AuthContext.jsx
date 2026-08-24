import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'
import AuthContext from './auth-context.js'

const SESSION_KEY = 'jwt-auth-session'

const readStoredSession = () => {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw)
    return session?.token ? session : null
  } catch {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

const storeSession = (session, remember) => {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(session))
}

const removeStoredSession = () => {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())
  const [initializing, setInitializing] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  const clearSession = useCallback((expired = false) => {
    removeStoredSession()
    setSession(null)
    setSessionExpired(expired)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const restoreSession = async () => {
      if (!session?.token) {
        setInitializing(false)
        return
      }

      try {
        const response = await authService.getCurrentUser(session.token, controller.signal)
        const refreshed = { ...session, user: response.user }
        const remember = Boolean(localStorage.getItem(SESSION_KEY))
        storeSession(refreshed, remember)
        setSession(refreshed)
      } catch (error) {
        if (error.name !== 'AbortError') clearSession(error.status === 401)
      } finally {
        setInitializing(false)
      }
    }

    void restoreSession()
    return () => controller.abort()
    // Session restoration should only run when the provider mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (credentials, remember) => {
    const response = await authService.login(credentials)
    const nextSession = { token: response.token, user: response.user }
    storeSession(nextSession, remember)
    setSession(nextSession)
    setSessionExpired(false)
    return response.user
  }, [])

  const register = useCallback((payload) => authService.register(payload), [])

  const logout = useCallback(async () => {
    try {
      if (session?.token) await authService.logout(session.token)
    } finally {
      clearSession(false)
    }
  }, [clearSession, session])

  const refreshUser = useCallback(async () => {
    if (!session?.token) return null
    try {
      const response = await authService.getCurrentUser(session.token)
      const refreshed = { ...session, user: response.user }
      const remember = Boolean(localStorage.getItem(SESSION_KEY))
      storeSession(refreshed, remember)
      setSession(refreshed)
      return response.user
    } catch (error) {
      if (error.status === 401) clearSession(true)
      throw error
    }
  }, [clearSession, session])

  const changePassword = useCallback(async (payload) => {
    if (!session?.token) throw new Error('Phiên đăng nhập không tồn tại')
    try {
      await authService.changePassword(payload, session.token)
      clearSession(false)
    } catch (error) {
      if (error.status === 401) clearSession(true)
      throw error
    }
  }, [clearSession, session])

  const value = useMemo(() => ({
    token: session?.token || null,
    user: session?.user || null,
    initializing,
    sessionExpired,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    expireSession: () => clearSession(true),
    clearExpiredState: () => setSessionExpired(false),
  }), [
    session,
    initializing,
    sessionExpired,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    clearSession,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
