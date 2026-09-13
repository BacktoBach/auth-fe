import { useState } from 'react'
import { KeyRound, LoaderCircle, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/useAuth.js'
import { getApiFieldErrors, validateChangePasswordForm } from '../utils/validation.js'

export default function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [visible, setVisible] = useState({ old: false, next: false, confirm: false })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setErrors((current) => ({ ...current, [event.target.name]: '' }))
    setServerError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateChangePasswordForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return
    setSubmitting(true)
    try {
      await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword })
      navigate('/login', { replace: true, state: { message: 'Đổi mật khẩu thành công. Token cũ đã bị thu hồi, vui lòng đăng nhập lại.' } })
    } catch (requestError) {
      setErrors(getApiFieldErrors(requestError))
      setServerError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6"><h2 className="text-2xl font-bold tracking-tight">Đổi mật khẩu</h2><p className="mt-1 text-sm text-slate-500">Xác minh mật khẩu hiện tại trước khi tạo mật khẩu mới.</p></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><KeyRound size={22} /></div><div><h3 className="font-bold">Thông tin mật khẩu</h3><p className="text-xs text-slate-500">Các trường đều bắt buộc</p></div></div>
          {serverError && <div className="mb-5"><Alert>{serverError}</Alert></div>}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField id="oldPassword" name="oldPassword" label="Mật khẩu hiện tại" type="password" autoComplete="current-password" value={form.oldPassword} onChange={handleChange} error={errors.oldPassword} showPassword={visible.old} onTogglePassword={() => setVisible((value) => ({ ...value, old: !value.old }))} />
            <FormField id="newPassword" name="newPassword" label="Mật khẩu mới" type="password" autoComplete="new-password" value={form.newPassword} onChange={handleChange} error={errors.newPassword} showPassword={visible.next} onTogglePassword={() => setVisible((value) => ({ ...value, next: !value.next }))} />
            <FormField id="confirmPassword" name="confirmPassword" label="Xác nhận mật khẩu mới" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} showPassword={visible.confirm} onTogglePassword={() => setVisible((value) => ({ ...value, confirm: !value.confirm }))} />
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => navigate(-1)} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Hủy</button><button type="submit" disabled={submitting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{submitting ? <><LoaderCircle size={18} className="animate-spin" /> Đang cập nhật...</> : 'Cập nhật mật khẩu'}</button></div>
          </form>
        </section>
        <aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 shrink-0 text-amber-700" size={22} /><div><h3 className="font-bold text-amber-950">Điều gì xảy ra sau đó?</h3><p className="mt-2 text-sm leading-6 text-amber-800">Hệ thống tăng <code>tokenVersion</code>, vì vậy mọi token cũ của tài khoản sẽ bị từ chối. Bạn sẽ được chuyển về trang đăng nhập.</p></div></div>
          <div className="mt-5 border-t border-amber-200 pt-5 text-sm text-amber-900"><p className="font-bold">Yêu cầu mật khẩu</p><ul className="mt-2 list-disc space-y-1.5 pl-5 text-amber-800"><li>Ít nhất 8 ký tự</li><li>Tối đa 72 byte UTF-8</li><li>Khác mật khẩu hiện tại</li></ul></div>
        </aside>
      </div>
    </div>
  )
}
