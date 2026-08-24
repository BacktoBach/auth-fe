import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle, RefreshCw, Search, Users } from 'lucide-react'
import Alert from '../components/Alert.jsx'
import { useAuth } from '../context/useAuth.js'
import { userService } from '../services/userService.js'

const initials = (name = '') => name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
const shortenId = (id = '') => id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id

export default function UsersPage() {
  const { token, expireSession } = useAuth()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const loadUsers = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await userService.getUsers({ page, limit, token, signal: controller.signal })
        setUsers(response.users)
        setPagination(response.pagination)
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        if (requestError.status === 401) expireSession()
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }
    void loadUsers()
    return () => controller.abort()
  }, [expireSession, limit, page, reloadKey, token])

  const visibleUsers = users.filter((user) => {
    const normalized = query.trim().toLowerCase()
    return !normalized || user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized)
  })
  const pages = Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(page - 2, pagination.totalPages - 4))
    return start + index
  }).filter((value) => value <= pagination.totalPages)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-violet-600">Admin only</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Danh sách người dùng</h2><p className="mt-1 text-sm text-slate-500">Dữ liệu chỉ đọc, lấy từ endpoint phân trang của backend.</p></div><button onClick={() => setReloadKey((value) => value + 1)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><RefreshCw size={17} /> Làm mới</button></section>
      {error && <Alert>{error}</Alert>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="relative max-w-sm flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lọc tên hoặc email trong trang..." className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" /></div><div className="flex items-center gap-2 text-sm text-slate-500"><span>Hiển thị</span><select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1) }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-700 outline-none focus:border-indigo-500">{[10, 20, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}</select><span>/ trang</span></div></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-3.5">Người dùng</th><th className="px-6 py-3.5">Email</th><th className="px-6 py-3.5">User ID</th><th className="px-6 py-3.5">Vai trò</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan="4" className="px-6 py-16 text-center"><LoaderCircle className="mx-auto animate-spin text-indigo-600" size={28} /><p className="mt-3 text-sm font-medium text-slate-500">Đang tải người dùng...</p></td></tr>}
              {!loading && visibleUsers.map((user) => <tr key={user.id} className="transition hover:bg-slate-50/80"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials(user.name)}</div><span className="text-sm font-bold text-slate-900">{user.name}</span></div></td><td className="px-6 py-4 text-sm text-slate-600">{user.email}</td><td className="px-6 py-4 font-mono text-xs text-slate-500" title={user.id}>{shortenId(user.id)}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></td></tr>)}
              {!loading && visibleUsers.length === 0 && <tr><td colSpan="4" className="px-6 py-16 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Users size={23} /></div><p className="mt-3 font-bold text-slate-800">Không tìm thấy người dùng</p><p className="mt-1 text-sm text-slate-500">Hãy thử từ khóa khác hoặc làm mới dữ liệu.</p></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-sm text-slate-500">Trang <strong className="text-slate-800">{pagination.page}</strong> / {pagination.totalPages || 1} · Tổng <strong className="text-slate-800">{pagination.total}</strong> người dùng</p><div className="flex items-center gap-1.5"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang trước"><ChevronLeft size={17} /></button>{pages.map((value) => <button key={value} onClick={() => setPage(value)} className={`grid size-9 place-items-center rounded-lg text-sm font-bold ${value === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{value}</button>)}<button disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang sau"><ChevronRight size={17} /></button></div></div>
      </section>
    </div>
  )
}
