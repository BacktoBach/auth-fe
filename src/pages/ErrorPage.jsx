import { Clock3, Home, LockKeyhole, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { getDashboardPath, ROUTES } from '../routes/paths.js'

const variants = {
  forbidden: { code: '403', title: 'Bạn không có quyền truy cập', description: 'Trang này chỉ dành cho tài khoản có role admin.', icon: LockKeyhole, accent: 'text-rose-600 bg-rose-50' },
  expired: { code: '401', title: 'Phiên đăng nhập đã kết thúc', description: 'Token đã hết hạn hoặc không còn hợp lệ. Hãy đăng nhập lại để tiếp tục.', icon: Clock3, accent: 'text-amber-700 bg-amber-50' },
  notFound: { code: '404', title: 'Không tìm thấy trang', description: 'Đường dẫn bạn truy cập không tồn tại trong ứng dụng.', icon: SearchX, accent: 'text-indigo-700 bg-indigo-50' },
}

export default function ErrorPage({ type = 'notFound' }) {
  const { user, clearExpiredState } = useAuth()
  const config = variants[type]
  const Icon = config.icon
  const destination = type === 'expired' || !user ? ROUTES.login : getDashboardPath(user.role)
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-4"><section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12"><div className={`mx-auto grid size-16 place-items-center rounded-2xl ${config.accent}`}><Icon size={30} /></div><p className="mt-6 text-sm font-black tracking-[0.22em] text-slate-300">ERROR {config.code}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{config.title}</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">{config.description}</p><Link to={destination} onClick={type === 'expired' ? clearExpiredState : undefined} className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"><Home size={18} /> {type === 'expired' || !user ? 'Đến trang đăng nhập' : 'Về dashboard'}</Link></section></main>
}
