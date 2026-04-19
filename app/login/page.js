'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas')
        setLoading(false)
        return
      }

      localStorage.setItem('wabot_token', data.token)
      localStorage.setItem('wabot_business_id', data.business_id)
      localStorage.setItem('wabot_business_name', data.business_name)
      document.cookie = `wabot_token=${data.token}; path=/; max-age=86400`

      router.push('/dashboard')

    } catch (err) {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-[440px] flex flex-col gap-8">

        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
              <span className="text-white font-black text-sm">W</span>
            </div>
          </div>
          <h1 className="text-slate-900 text-3xl font-black tracking-tighter mb-1">WaBot Panel</h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase opacity-70">Acceso al panel de administración</p>
        </div>

        {/* Card */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#25D366] hover:brightness-95 active:scale-[0.98] transition-all text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Ingresar al panel'}
            </button>

          </form>
        </section>

        {/* Status */}
        <div className="flex items-center justify-center gap-3 bg-white/50 px-4 py-2 rounded-full border border-slate-100">
          <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sistema activo</span>
        </div>

      </div>
    </main>
  )
}