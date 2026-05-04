'use client'
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STATE_COLORS = {
  PENDIENTE:      'bg-yellow-100 text-yellow-700',
  VALIDANDO_PAGO: 'bg-blue-100 text-blue-700',
  EN_PREPARACION: 'bg-orange-100 text-orange-700',
  EN_CAMINO:      'bg-purple-100 text-purple-700',
  ENTREGADO:      'bg-green-100 text-green-700',
  RECHAZADO:      'bg-red-100 text-red-600',
  PAGO_RECHAZADO: 'bg-red-100 text-red-600',
}

const FILTERS = ['TODOS', 'PENDIENTE', 'VALIDANDO_PAGO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'RECHAZADO']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('TODOS')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const businessId = localStorage.getItem('wabot_business_id')
  
  // Carga inicial
  loadOrders()

  // Supabase Realtime
  const channel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${businessId}`
      },
      (payload) => {
        console.log('🔄 Cambio en orders:', payload)
        loadOrders() // Recargar lista completa
      }
    )
    .subscribe()

  // Cleanup al desmontar
  return () => {
    supabase.removeChannel(channel)
  }
}, [filter])

  async function loadOrders() {
    setLoading(true)
    const businessId = localStorage.getItem('wabot_business_id')
    const api = process.env.NEXT_PUBLIC_API_URL

    try {
      const url = filter === 'TODOS'
        ? `${api}/orders?business_id=${businessId}`
        : `${api}/orders?business_id=${businessId}&state=${filter}`

      const res = await fetch(url)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando órdenes:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateState(orderId, newState) {
    const api = process.env.NEXT_PUBLIC_API_URL
    try {
      await fetch(`${api}/orders/${orderId}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      })
      loadOrders()
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }

  function formatItems(items) {
    if (!items?.length) return 'Sin items'
    return items.map(i => `${i.quantity}x ${i.name}`).join(', ')
  }

  function formatTime(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }

  function getActions(order) {
    if (order.state === 'PENDIENTE') return (
      <div className="flex gap-2">
        <button onClick={() => updateState(order.id, 'EN_PREPARACION')} className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all">Preparar</button>
        <button onClick={() => updateState(order.id, 'RECHAZADO')} className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all">Rechazar</button>
      </div>
    )
    if (order.state === 'EN_PREPARACION') return (
      <button onClick={() => updateState(order.id, 'EN_CAMINO')} className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all">En camino</button>
    )
    if (order.state === 'EN_CAMINO') return (
      <button onClick={() => updateState(order.id, 'ENTREGADO')} className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-all">Entregado</button>
    )
    if (order.state === 'ENTREGADO') return <span className="text-xs text-slate-300 font-bold">Completado</span>
    if (order.state === 'RECHAZADO') return <span className="text-xs text-red-300 font-bold">Rechazado</span>
    return null
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pedidos</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} órdenes encontradas</p>
        </div>
        <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest transition-all
              ${filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <span className="material-symbols-outlined text-slate-300 text-5xl">receipt_long</span>
          <p className="text-slate-400 font-medium mt-4">No hay órdenes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className={`bg-white rounded-2xl shadow-sm p-5 flex items-center gap-6 hover:translate-x-1 transition-all ${order.state === 'RECHAZADO' ? 'border-l-4 border-red-400' : ''}`}>
              <div className="flex-shrink-0 w-16 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">#{order.id.slice(-4)}</p>
                <p className="text-xs font-black text-[#006d2f]">{formatTime(order.created_at)}</p>
              </div>
              <div className="w-40">
                <p className="text-sm font-bold text-slate-900">{order.customers?.phone_number || 'Sin número'}</p>
                <p className="text-xs text-slate-400 truncate">{order.delivery_address || 'Sin dirección'}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 truncate">{formatItems(order.items)}</p>
              </div>
              <div className="text-right w-24">
                <p className="text-sm font-black text-slate-900">${Number(order.total).toLocaleString('es-CO')}</p>
              </div>
              <div className="w-36 text-center">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${STATE_COLORS[order.state] || 'bg-slate-100 text-slate-600'}`}>
                  {order.state}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getActions(order)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}