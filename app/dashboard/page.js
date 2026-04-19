'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalCustomers: 0,
    todayRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const businessId = localStorage.getItem('wabot_business_id')
    const api = process.env.NEXT_PUBLIC_API_URL

    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`${api}/stats?business_id=${businessId}`),
        fetch(`${api}/orders?business_id=${businessId}`)
      ])

      const statsData = await statsRes.json()
      const ordersData = await ordersRes.json()

      setStats(statsData)
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : [])
    } catch (err) {
      console.error('Error cargando dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Órdenes hoy',     value: stats.totalOrders,    icon: 'receipt_long', color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Órdenes activas', value: stats.activeOrders,   icon: 'local_shipping', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Clientes',        value: stats.totalCustomers, icon: 'group',        color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Ingresos hoy',    value: `$${Number(stats.todayRevenue).toLocaleString('es-CO')}`, icon: 'payments', color: 'text-[#006d2f]', bg: 'bg-[#25D366]/10' },
  ]

  const stateColors = {
    PENDIENTE:      'bg-yellow-100 text-yellow-700',
    VALIDANDO_PAGO: 'bg-blue-100 text-blue-700',
    EN_PREPARACION: 'bg-orange-100 text-orange-700',
    EN_CAMINO:      'bg-purple-100 text-purple-700',
    ENTREGADO:      'bg-green-100 text-green-700',
    RECHAZADO:      'bg-red-100 text-red-600',
    PAGO_RECHAZADO: 'bg-red-100 text-red-600',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Cargando...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen de operaciones en tiempo real</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <span className={`material-symbols-outlined text-[20px] ${card.color}`}>{card.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Órdenes recientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Órdenes recientes</h2>
          <a href="/dashboard/orders" className="text-[10px] font-bold text-[#25D366] uppercase tracking-widest hover:underline">
            Ver todas
          </a>
        </div>
        <div className="divide-y divide-slate-50">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-slate-400 text-sm text-center">No hay órdenes recientes</p>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-slate-400">#{order.id.slice(-4)}</p>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.customers?.phone_number || 'Sin número'}</p>
                    <p className="text-xs text-slate-400">{order.delivery_address || 'Sin dirección'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-black text-slate-900">${Number(order.total).toLocaleString('es-CO')}</p>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${stateColors[order.state] || 'bg-slate-100 text-slate-600'}`}>
                    {order.state}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}