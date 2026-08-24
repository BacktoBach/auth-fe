import { Eye, EyeOff } from 'lucide-react'

export default function FormField({
  id,
  label,
  error,
  type = 'text',
  showPassword,
  onTogglePassword,
  ...inputProps
}) {
  const isPassword = type === 'password'
  const actualType = isPassword && showPassword ? 'text' : type

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={actualType}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
          } ${isPassword ? 'pr-11' : ''}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition hover:text-slate-700"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}
