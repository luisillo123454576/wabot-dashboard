'use client'
import { useEffect, useState } from 'react'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
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
      setOrders(Array.isArray(ordersData) ? ordersData : [])
    } catch (err) {
      console.error('Error cargando analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  function getStateCount(state) {
    return orders.filter(o => o.state === state).length
  }

  function getConversionRate() {
    if (!orders.length) return 0
    const delivered = getStateCount('ENTREGADO')
    return ((delivered / orders.length) * 100).toFixed(1)
  }

  function getTotalRevenue() {
    return orders
      .filter(o => o.state === 'ENTREGADO')
      .reduce((acc, o) => acc + o.total, 0)
  }

  function getAvgTicket() {
    const delivered = orders.filter(o => o.state === 'ENTREGADO')
    if (!delivered.length) return 0
    return getTotalRevenue() / delivered.length
  }

  const stateStats = [
    { label: 'Pendientes',      state: 'PENDIENTE',      color: 'bg-yellow-400' },
    { label: 'En preparación',  state: 'EN_PREPARACION', color: 'bg-orange-400' },
    { label: 'En camino',       state: 'EN_CAMINO',      color: 'bg-purple-400' },
    { label: 'Entregados',      state: 'ENTREGADO',      color: 'bg-[#25D366]'  },
    { label: 'Rechazados',      state: 'RECHAZADO',      color: 'bg-red-400'    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-black text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Métricas generales del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total órdenes',    value: orders.length,                                            icon: 'receipt_long',  color: 'text-blue-600',   bg: 'bg-blue-50'          },
          { label: 'Tasa conversión',  value: `${getConversionRate()}%`,                                icon: 'trending_up',   color: 'text-[#006d2f]',  bg: 'bg-[#25D366]/10'     },
          { label: 'Ingresos totales', value: `$${getTotalRevenue().toLocaleString('es-CO')}`,          icon: 'payments',      color: 'text-purple-600', bg: 'bg-purple-50'        },
          { label: 'Ticket promedio',  value: `$${Math.round(getAvgTicket()).toLocaleString('es-CO')}`, icon: 'avg_pace',      color: 'text-orange-600', bg: 'bg-orange-50'        },
        ].map((card, i) => (
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

      {/* Distribución por estado */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
          Distribución por estado
        </h2>
        <div className="space-y-4">
          {stateStats.map(s => {
            const count = getStateCount(s.state)
            const pct = orders.length ? ((count / orders.length) * 100).toFixed(1) : 0
            return (
              <div key={s.state}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-600">{s.label}</span>
                  <span className="text-xs font-black text-slate-900">{count} <span className="text-slate-400 font-medium">({pct}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${s.color} transition-all`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}