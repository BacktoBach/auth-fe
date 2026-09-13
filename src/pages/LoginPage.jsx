import { useState } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/useAuth.js'
import { getApiFieldErrors, validateLoginForm } from '../utils/validation.js'

export default function LoginPage() {
  const { user, login, clearExpiredState } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateLoginForm(form)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length) return
    setError('')
    setSubmitting(true)
    try {
      clearExpiredState()
      const loggedInUser = await login(form, remember)
      const intendedPath = location.state?.from
      const fallback = loggedInUser.role === 'admin' ? '/admin' : '/dashboard'
      const canReturn = intendedPath === '/change-password'
        || intendedPath === '/dashboard'
        || (loggedInUser.role === 'admin' && intendedPath?.startsWith('/admin'))
      const destination = canReturn
        ? intendedPath
        : fallback
      navigate(destination, { replace: true })
    } catch (requestError) {
      setFieldErrors(getApiFieldErrors(requestError))
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div className="mb-7">
        <p className="text-sm font-bold text-indigo-600">Chào mừng trở lại</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Đăng nhập</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sử dụng tài khoản của bạn để truy cập cổng quản lý.</p>
      </div>

      {location.state?.message && <div className="mb-5"><Alert type="success">{location.state.message}</Alert></div>}
      {error && <div className="mb-5"><Alert>{error}</Alert></div>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField id="email" name="email" label="Email" type="email" placeholder="name@example.com" autoComplete="email" value={form.email} onChange={handleChange} error={fieldErrors.email} required />
        <FormField id="password" name="password" label="Mật khẩu" type="password" placeholder="Nhập mật khẩu" autoComplete="current-password" value={form.password} onChange={handleChange} error={fieldErrors.password} showPassword={showPassword} onTogglePassword={() => setShowPassword((value) => !value)} required />
        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-4 rounded border-slate-300 accent-indigo-600" />
          Ghi nhớ đăng nhập
        </label>
        <button type="submit" disabled={submitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? <><LoaderCircle size={18} className="animate-spin" /> Đang đăng nhập...</> : <>Đăng nhập <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">Chưa có tài khoản? <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">Đăng ký ngay</Link></p>
      <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2.5 text-center text-xs leading-5 text-slate-500">Máy chủ Render miễn phí có thể cần một chút thời gian để khởi động ở lần truy cập đầu tiên.</p>
    </div>
  )
}
