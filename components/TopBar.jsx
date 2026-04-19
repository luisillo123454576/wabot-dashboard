'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TopBar() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    setBusinessName(localStorage.getItem('wabot_business_name') || 'Negocio')
    checkNotifications()
    const interval = setInterval(checkNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function checkNotifications() {
    try {
      const businessId = localStorage.getItem('wabot_business_id')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?business_id=${businessId}&state=PENDIENTE`)
      const orders = await res.json()
      if (Array.isArray(orders)) setNotifications(orders.slice(0, 5))
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
    }
  }
  
  function handleLogout() {
  localStorage.removeItem('wabot_token')
  localStorage.removeItem('wabot_business_id')
  localStorage.removeItem('wabot_business_name')
  document.cookie = 'wabot_token=; path=/; max-age=0'
  router.push('/login')
}

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 border-b border-slate-100">
      
      {/* Búsqueda */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Live status */}
        <div className="flex items-center gap-2 bg-[#25D366]/10 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#006d2f] uppercase tracking-widest">Live</span>
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-slate-500">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
              <div className="p-4 border-b border-slate-100">
                <p className="text-sm font-black text-slate-900">Notificaciones</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">Sin notificaciones</p>
                ) : (
                  notifications.map(o => (
                    <div
                      key={o.id}
                      onClick={() => { router.push('/dashboard/orders'); setShowDropdown(false) }}
                      className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-all border-b border-slate-50"
                    >
                      <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Nuevo pedido pendiente</p>
                        <p className="text-[10px] text-slate-400">
                          {o.customers?.phone_number} — ${Number(o.total).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + logout */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
            <span className="text-[#006d2f] font-black text-sm">
              {businessName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900">Admin</p>
            <p className="text-[10px] text-[#006d2f] font-bold">{businessName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 p-2 hover:bg-slate-100 rounded-xl transition-all"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-slate-400 text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}