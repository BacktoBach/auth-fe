import { Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import ChangePasswordPage from '../pages/ChangePasswordPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ErrorPage from '../pages/ErrorPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import UsersPage from '../pages/UsersPage.jsx'
import { AdminRoute, HomeRedirect, ProtectedRoute } from './RouteGuards.jsx'
import { ROUTES } from './paths.js'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.changePassword} element={<ChangePasswordPage />} />

          <Route element={<AdminRoute />}>
            <Route path={ROUTES.adminDashboard} element={<DashboardPage />} />
            <Route path={ROUTES.adminUsers} element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path={ROUTES.home} element={<HomeRedirect />} />
      <Route path={ROUTES.forbidden} element={<ErrorPage type="forbidden" />} />
      <Route path={ROUTES.sessionExpired} element={<ErrorPage type="expired" />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}
