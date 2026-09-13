import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  changePassword as requestPasswordChange,
  getCurrentUser,
  login as requestLogin,
  logout as requestLogout,
  register as requestRegister,
} from '../services/authService.js'
import { setUnauthorizedHandler } from '../services/api.js'
import AuthContext from './auth-context.js'

const AUTH_CHANNEL = 'auth-session'
const AUTH_EVENT_KEY = 'auth-sync-event'
const TAB_ID = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`

const publishAuthEvent = (type) => {
  const event = {
    type,
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    sourceTabId: TAB_ID,
    timestamp: Date.now(),
  }

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(AUTH_CHANNEL)
    channel.postMessage(event)
    channel.close()
  }
  try {
    localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify(event))
  } catch {
    // BroadcastChannel already covers supported browsers when storage is unavailable.
  }
}

export function AuthProvider({ children }) {
  const lastEventIdRef = useRef(null)
  const sessionExpiredRef = useRef(false)
  const [user, setUser] = useState(null)
  const [expiresAt, setExpiresAt] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  const clearSession = useCallback((expired = false) => {
    sessionExpiredRef.current = expired
    setUser(null)
    setExpiresAt(null)
    setSessionExpired(expired)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const restoreSession = async () => {
      try {
        const response = await getCurrentUser({
          signal: controller.signal,
          notifyUnauthorized: false,
        })
        setUser(response.user)
        setExpiresAt(response.session?.expiresAt || null)
      } catch (error) {
        if (error.name !== 'AbortError') clearSession(false)
      } finally {
        if (!controller.signal.aborted) setInitializing(false)
      }
    }

    void restoreSession()
    return () => controller.abort()
  }, [clearSession])

  useEffect(() => setUnauthorizedHandler(() => {
    if (sessionExpiredRef.current) return
    clearSession(true)
    publishAuthEvent('SESSION_EXPIRED')
  }), [clearSession])

  useEffect(() => {
    if (!expiresAt) return undefined
    const remainingMs = Date.parse(expiresAt) - Date.now()
    const timer = window.setTimeout(() => {
      clearSession(true)
      publishAuthEvent('SESSION_EXPIRED')
    }, Number.isFinite(remainingMs) ? Math.max(remainingMs, 0) : 0)
    return () => window.clearTimeout(timer)
  }, [clearSession, expiresAt])

  useEffect(() => {
    const synchronize = async (event) => {
      if (
        !event?.type
        || event.sourceTabId === TAB_ID
        || event.id === lastEventIdRef.current
      ) return
      lastEventIdRef.current = event.id || null
      if (event?.type === 'SIGNED_IN') {
        try {
          const response = await getCurrentUser({ notifyUnauthorized: false })
          setUser(response.user)
          setExpiresAt(response.session?.expiresAt || null)
          sessionExpiredRef.current = false
          setSessionExpired(false)
        } catch {
          clearSession(false)
        }
      } else if (event?.type === 'SESSION_EXPIRED') clearSession(true)
      else if (event?.type === 'SIGNED_OUT' || event?.type === 'PASSWORD_CHANGED') {
        clearSession(false)
      }
    }

    const channel = 'BroadcastChannel' in window ? new BroadcastChannel(AUTH_CHANNEL) : null
    const onChannelMessage = ({ data }) => void synchronize(data)
    const onStorage = (event) => {
      if (event.key !== AUTH_EVENT_KEY || !event.newValue) return
      try {
        void synchronize(JSON.parse(event.newValue))
      } catch {
        // Ignore malformed synchronization events from storage.
      }
    }

    if (channel) channel.onmessage = onChannelMessage
    window.addEventListener('storage', onStorage)
    return () => {
      channel?.close()
      window.removeEventListener('storage', onStorage)
    }
  }, [clearSession])

  const login = useCallback(async (credentials, remember) => {
    const response = await requestLogin({ ...credentials, remember })
    setUser(response.user)
    setExpiresAt(response.session?.expiresAt || null)
    sessionExpiredRef.current = false
    setSessionExpired(false)
    publishAuthEvent('SIGNED_IN')
    return response.user
  }, [])

  const register = useCallback((payload) => requestRegister(payload), [])

  const logout = useCallback(async () => {
    try {
      await requestLogout()
    } finally {
      clearSession(false)
      publishAuthEvent('SIGNED_OUT')
    }
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    const response = await getCurrentUser()
    setUser(response.user)
    setExpiresAt(response.session?.expiresAt || null)
    return response.user
  }, [])

  const changePassword = useCallback(async (payload) => {
    await requestPasswordChange(payload)
    clearSession(false)
    publishAuthEvent('PASSWORD_CHANGED')
  }, [clearSession])

  const value = useMemo(() => ({
    user,
    expiresAt,
    initializing,
    sessionExpired,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    clearExpiredState: () => setSessionExpired(false),
  }), [
    user,
    expiresAt,
    initializing,
    sessionExpired,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
