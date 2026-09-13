import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react'
import Brand from '../components/Brand.jsx'
import { useAuth } from '../context/useAuth.js'

const initials = (name = '') => name
  .split(' ')
  .filter(Boolean)
  .slice(-2)
  .map((part) => part[0])
  .join('')
  .toUpperCase()

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const homePath = user.role === 'admin' ? '/admin' : '/dashboard'

  const navigation = [
    { to: homePath, label: 'Tổng quan', icon: LayoutDashboard, end: true },
    ...(user.role === 'admin' ? [{ to: '/admin/users', label: 'Người dùng', icon: Users }] : []),
    { to: '/change-password', label: 'Đổi mật khẩu', icon: KeyRound },
  ]

  const pageTitle = location.pathname === '/admin/users'
    ? 'Quản lý người dùng'
    : location.pathname === '/change-password'
      ? 'Đổi mật khẩu'
      : 'Tổng quan tài khoản'

  const handleLogout = async () => {
    setLoggingOut(true)
    let message = 'Bạn đã đăng xuất thành công.'
    try {
      await logout()
    } catch {
      message = 'Đã xóa phiên trên giao diện nhưng không thể xác nhận với máy chủ.'
    }
    navigate('/login', { replace: true, state: { message } })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          aria-label="Đóng menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Brand compact />
          <button className="text-slate-500 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
            <X size={22} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <nav className="mt-3 space-y-1.5">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon size={19} />
                <span>{label}</span>
                <ChevronRight size={16} className="ml-auto opacity-0 transition group-hover:opacity-100" />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-4">
            <button className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
              <Menu size={21} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">JWT Auth Portal</p>
              <h1 className="text-lg font-bold text-slate-950">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-2 pr-3 shadow-sm">
            <div className="grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials(user.name)}</div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
              {user.role}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><LogOut size={22} /></div>
            <h2 className="mt-4 text-lg font-bold">Xác nhận đăng xuất?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Cookie đăng nhập sẽ được xóa và bạn cần đăng nhập lại để tiếp tục.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setConfirmLogout(false)}>Hủy</button>
              <button disabled={loggingOut} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60" onClick={handleLogout}>
                {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
