import { ShieldCheck } from 'lucide-react'

export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${compact ? 'size-9' : 'size-11'} grid place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200`}>
        <ShieldCheck size={compact ? 20 : 24} strokeWidth={2.2} />
      </span>
      <div>
        <p className={`${compact ? 'text-base' : 'text-lg'} font-bold tracking-tight text-slate-950`}>JWT Auth</p>
        {!compact && <p className="text-xs font-medium text-slate-500">Secure access portal</p>}
      </div>
    </div>
  )
}
