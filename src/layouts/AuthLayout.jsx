import { CheckCircle2, LockKeyhole } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Brand from '../components/Brand.jsx'

export default function AuthLayout() {
  return (
    <main className="auth-grid min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:p-0">
      <section className="relative hidden overflow-hidden bg-indigo-700 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="relative z-10 brightness-0 invert">
          <Brand />
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-6 grid size-14 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
            <LockKeyhole size={28} />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Xác thực an toàn,<br />quản lý rõ ràng.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-indigo-100">
            Cổng truy cập sử dụng JWT, bảo vệ route và phân quyền theo vai trò user/admin.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-indigo-50">
            {['Token hết hạn sau 1 ngày', 'Mật khẩu được bảo vệ bằng bcrypt', 'RBAC kiểm soát quyền admin'].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-indigo-200" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-indigo-200">JWT Authentication API · Learning Project</p>
      </section>

      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center lg:min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden"><Brand /></div>
          <Outlet />
        </div>
      </section>
    </main>
  )
}
