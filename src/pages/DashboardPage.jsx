import { useEffect, useState } from 'react'
import { Activity, CheckCircle2, Clock3, Copy, KeyRound, RefreshCw, ShieldCheck, UserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import { useAuth } from '../context/useAuth.js'
import { checkHealth } from '../services/api.js'
import { getUsers } from '../services/userService.js'

const initials = (name = '') => name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()

function StatCard({ icon: Icon, label, value, detail, tone = 'indigo' }) {
  const tones = { indigo: 'bg-indigo-50 text-indigo-700', emerald: 'bg-emerald-50 text-emerald-700', violet: 'bg-violet-50 text-violet-700' }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user, token, refreshUser, expireSession } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [apiHealthy, setApiHealthy] = useState(null)
  const [totalUsers, setTotalUsers] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const loadOverview = async () => {
      try {
        const health = await checkHealth(controller.signal)
        setApiHealthy(health.status === 'healthy')
        if (user.role === 'admin') {
          const response = await getUsers({ page: 1, limit: 1, token, signal: controller.signal })
          setTotalUsers(response.pagination.total)
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        if (requestError.status === 401) expireSession()
        setApiHealthy(false)
      }
    }
    void loadOverview()
    return () => controller.abort()
  }, [expireSession, token, user.role])

  const handleRefresh = async () => {
    setRefreshing(true)
    setError('')
    try {
      await refreshUser()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setRefreshing(false)
    }
  }

  const copyId = async () => {
    await navigator.clipboard.writeText(user.id)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      {error && <Alert>{error}</Alert>}
      <section className="dashboard-hero overflow-hidden rounded-3xl bg-indigo-700 p-6 text-white shadow-xl shadow-indigo-100 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider"><ShieldCheck size={15} /> {user.role === 'admin' ? 'Admin workspace' : 'User workspace'}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Xin chào, {user.name}!</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">Tài khoản đang được bảo vệ bằng JWT. Thông tin bên dưới được tải trực tiếp từ endpoint <code>/api/auth/me</code>.</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-70"><RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}</button>
        </div>
      </section>

      <section className={`grid gap-4 ${user.role === 'admin' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <StatCard icon={Activity} label="Trạng thái API" value={apiHealthy === null ? 'Đang kiểm tra' : apiHealthy ? 'Sẵn sàng' : 'Gián đoạn'} detail="MongoDB health check" tone="emerald" />
        <StatCard icon={Clock3} label="Thời hạn token" value="1 ngày" detail="Đăng nhập lại sau khi hết hạn" />
        {user.role === 'admin' && <StatCard icon={Users} label="Tổng người dùng" value={totalUsers ?? '—'} detail="Dữ liệu từ admin endpoint" tone="violet" />}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h3 className="font-bold text-slate-950">Thông tin tài khoản</h3><p className="mt-1 text-xs text-slate-500">Dữ liệu công khai được trả về bởi API</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></div>
          <div className="p-6">
            <div className="mb-7 flex items-center gap-4"><div className="grid size-16 place-items-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">{initials(user.name)}</div><div><p className="text-xl font-bold text-slate-950">{user.name}</p><p className="mt-1 text-sm text-slate-500">{user.email}</p></div></div>
            <dl className="divide-y divide-slate-100">
              <div className="grid gap-1 py-4 sm:grid-cols-[140px_1fr] sm:items-center"><dt className="text-sm font-semibold text-slate-500">Họ và tên</dt><dd className="text-sm font-semibold text-slate-900">{user.name}</dd></div>
              <div className="grid gap-1 py-4 sm:grid-cols-[140px_1fr] sm:items-center"><dt className="text-sm font-semibold text-slate-500">Email</dt><dd className="text-sm font-semibold text-slate-900">{user.email}</dd></div>
              <div className="grid gap-1 py-4 sm:grid-cols-[140px_1fr] sm:items-center"><dt className="text-sm font-semibold text-slate-500">User ID</dt><dd className="flex min-w-0 items-center gap-2 text-sm font-mono text-slate-700"><span className="truncate">{user.id}</span><button onClick={copyId} className="shrink-0 text-slate-400 hover:text-indigo-600" title="Sao chép ID"><Copy size={16} /></button>{copied && <span className="text-xs font-sans font-semibold text-emerald-600">Đã sao chép</span>}</dd></div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={20} /></div><div><h3 className="font-bold">Bảo mật đang hoạt động</h3><p className="text-xs text-slate-500">JWT + bcrypt + RBAC</p></div></div>
            <ul className="mt-5 space-y-3 text-sm text-slate-600"><li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Token được verify ở mỗi protected route</li><li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Role được đọc lại từ database</li><li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Token cũ bị thu hồi khi đổi mật khẩu</li></ul>
          </div>
          <Link to="/change-password" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><KeyRound size={20} /></div><div><p className="font-bold">Đổi mật khẩu</p><p className="text-xs text-slate-500">Thu hồi token hiện tại</p></div></div><span className="text-sm font-bold text-indigo-600 transition group-hover:translate-x-1">Mở →</span></Link>
          {user.role === 'admin' && <Link to="/admin/users" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><UserRound size={20} /></div><div><p className="font-bold">Quản lý người dùng</p><p className="text-xs text-slate-500">Admin-only route</p></div></div><span className="text-sm font-bold text-violet-600 transition group-hover:translate-x-1">Mở →</span></Link>}
        </div>
      </section>
    </div>
  )
}
