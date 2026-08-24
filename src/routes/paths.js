export const ROUTES = Object.freeze({
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  changePassword: '/change-password',
  adminDashboard: '/admin',
  adminUsers: '/admin/users',
  forbidden: '/forbidden',
  sessionExpired: '/session-expired',
})

export const getDashboardPath = (role) => (
  role === 'admin' ? ROUTES.adminDashboard : ROUTES.dashboard
)
