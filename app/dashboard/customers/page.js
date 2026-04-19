'use client'
import { useEffect, useState } from 'react'

const STATE_COLORS = {
  NUEVO:              'bg-slate-100 text-slate-600',
  MENU_ENVIADO:       'bg-blue-100 text-blue-700',
  ARMANDO_PEDIDO:     'bg-yellow-100 text-yellow-700',
  ESPERANDO_DIRECCION:'bg-orange-100 text-orange-700',
  ESPERANDO_PAGO:     'bg-purple-100 text-purple-700',
  VALIDANDO_PAGO:     'bg-blue-100 text-blue-700',
  EN_PREPARACION:     'bg-orange-100 text-orange-700',
  EN_CAMINO:          'bg-purple-100 text-purple-700',
  ENTREGADO:          'bg-green-100 text-green-700',
  CANCELADO:          'bg-red-100 text-red-600',
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    const businessId = localStorage.getItem('wabot_business_id')
    const api = process.env.NEXT_PUBLIC_API_URL

    try {
      const res = await fetch(`${api}/customers?business_id=${businessId}`)
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  function formatTime(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const filtered = customers.filter(c =>
    c.phone_number?.includes(search) ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.state?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{customers.length} clientes registrados</p>
        </div>
        <button onClick={loadCustomers} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Actualizar
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por teléfono, nombre o estado..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <span className="material-symbols-outlined text-slate-300 text-5xl">group</span>
          <p className="text-slate-400 font-medium mt-4">No hay clientes</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
          {filtered.map(customer => (
            <div key={customer.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#006d2f] font-black text-sm">
                    {customer.phone_number?.slice(-2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {customer.name || customer.phone_number}
                  </p>
                  <p className="text-xs text-slate-400">{customer.phone_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última actividad</p>
                  <p className="text-xs font-bold text-slate-600">
                    {formatDate(customer.last_activity)} · {formatTime(customer.last_activity)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente desde</p>
                  <p className="text-xs font-bold text-slate-600">{formatDate(customer.created_at)}</p>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${STATE_COLORS[customer.state] || 'bg-slate-100 text-slate-600'}`}>
                  {customer.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}