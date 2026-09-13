import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import AppLayout from '../layouts/AppLayout.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import ChangePasswordPage from '../pages/ChangePasswordPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ErrorPage from '../pages/ErrorPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import UsersPage from '../pages/UsersPage.jsx'

function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="text-center">
        <LoaderCircle className="mx-auto animate-spin text-indigo-600" size={34} />
        <p className="mt-3 text-sm font-medium text-slate-500">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    </div>
  )
}

function ProtectedRoute() {
  const { user, initializing, sessionExpired } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageLoader />
  if (!user) {
    if (sessionExpired) return <Navigate to="/session-expired" replace />
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function AdminRoute() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/forbidden" replace />
}

function HomeRedirect() {
  const { user, initializing } = useAuth()

  if (initializing) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />

  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="/forbidden" element={<ErrorPage type="forbidden" />} />
      <Route path="/session-expired" element={<ErrorPage type="expired" />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}
