import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '../context/useAuth.js'

export function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="text-center">
        <LoaderCircle className="mx-auto animate-spin text-indigo-600" size={34} />
        <p className="mt-3 text-sm font-medium text-slate-500">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { token, user, initializing, sessionExpired } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageLoader />
  if (!token || !user) {
    if (sessionExpired) return <Navigate to="/session-expired" replace />
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function AdminRoute() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/forbidden" replace />
}

export function HomeRedirect() {
  const { user, initializing } = useAuth()
  if (initializing) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
}
