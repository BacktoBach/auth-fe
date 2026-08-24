import { useState } from 'react'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/useAuth.js'
import { getDashboardPath, ROUTES } from '../routes/paths.js'

const passwordBytes = (value) => new TextEncoder().encode(value).length

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={getDashboardPath(user.role)} replace />

  const validate = () => {
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Họ tên phải có ít nhất 2 ký tự.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Email không hợp lệ.'
    if (form.password.length < 8) nextErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.'
    if (passwordBytes(form.password) > 72) nextErrors.password = 'Mật khẩu không được vượt quá 72 byte UTF-8.'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setErrors((current) => ({ ...current, [event.target.name]: '' }))
    setServerError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate(ROUTES.login, { replace: true, state: { message: 'Đăng ký thành công. Hãy đăng nhập để tiếp tục.' } })
    } catch (requestError) {
      setServerError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <Link to={ROUTES.login} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={17} /> Quay lại đăng nhập</Link>
      <div className="mb-6"><p className="text-sm font-bold text-indigo-600">Tạo tài khoản user</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Đăng ký</h2><p className="mt-2 text-sm leading-6 text-slate-500">Điền thông tin bên dưới để bắt đầu sử dụng hệ thống.</p></div>
      {serverError && <div className="mb-5"><Alert>{serverError}</Alert></div>}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField id="name" name="name" label="Họ và tên" placeholder="Nguyễn Văn A" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} />
        <FormField id="email" name="email" label="Email" type="email" placeholder="name@example.com" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField id="password" name="password" label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} showPassword={showPassword} onTogglePassword={() => setShowPassword((value) => !value)} />
        <FormField id="confirmPassword" name="confirmPassword" label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} showPassword={showConfirm} onTogglePassword={() => setShowConfirm((value) => !value)} />
        <button type="submit" disabled={submitting} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">
          {submitting ? <><LoaderCircle size={18} className="animate-spin" /> Đang tạo tài khoản...</> : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-slate-500">Tài khoản đăng ký từ trang này luôn có quyền <strong>user</strong>. Quyền admin được cấp trực tiếp trong cơ sở dữ liệu.</p>
    </div>
  )
}
