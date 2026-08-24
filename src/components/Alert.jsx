import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const styles = {
  error: ['border-rose-200 bg-rose-50 text-rose-700', AlertCircle],
  success: ['border-emerald-200 bg-emerald-50 text-emerald-700', CheckCircle2],
  info: ['border-indigo-200 bg-indigo-50 text-indigo-700', Info],
}

export default function Alert({ type = 'error', children }) {
  const [className, Icon] = styles[type]
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium ${className}`} role="alert">
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
