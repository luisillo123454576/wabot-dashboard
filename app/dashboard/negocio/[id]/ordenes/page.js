'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import supabase from '../../../../../lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'

const STATUS_CONFIG = {
  pending_payment: {
    label: 'Pago pendiente',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    icon: Clock
  },
  in_preparation: {
    label: 'En preparación',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    icon: Loader
  },
  delivered: {
    label: 'Entregado',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    icon: CheckCircle
  }
}

export default function OrdenesPage() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)

  async function loadData() {
    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()
    setBusiness(biz)

    const query = supabase
      .from('orders')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false })

    const { data: orderData } = filter === 'active'
      ? await query.in('status', ['pending_payment', 'in_preparation'])
      : await query.eq('status', 'delivered').limit(20)

    setOrders(orderData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    // Actualización en tiempo real
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${id}`
      }, () => loadData())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id, filter])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-green-400 animate-pulse">Cargando órdenes...</p>
    </div>
  )

  const activeCount = orders.filter(o => o.status === 'pending_payment' || o.status === 'in_preparation').length

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/dashboard/negocio/${id}`} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Órdenes</h1>
            <p className="text-zinc-400 text-sm mt-1">{business?.name}</p>
          </div>
          {filter === 'active' && activeCount > 0 && (
            <div className="ml-auto bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
              {activeCount} activa{activeCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'active' ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'delivered' ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            Historial
          </button>
        </div>

        {/* Lista de órdenes */}
        <div className="space-y-4">
          {orders.map(order => {
            const config = STATUS_CONFIG[order.status]
            const Icon = config.icon
            const minutesAgo = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60))

            return (
              <div key={order.id} className={`bg-zinc-900 rounded-2xl border p-6 ${config.bg}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={config.color} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                  <span className="text-zinc-500 text-xs">
                    {minutesAgo < 60 ? `hace ${minutesAgo} min` : `hace ${Math.floor(minutesAgo / 60)}h`}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-zinc-400 text-xs">Cliente</p>
                  <p className="text-white font-medium">+{order.customer_phone}</p>
                </div>

                {order.order_details && (
                  <div className="mt-4 space-y-2">
                    <p className="text-zinc-400 text-xs">Detalle del pedido</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{order.order_details}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <p className="text-zinc-500 text-xs">
                    {new Date(order.created_at).toLocaleString('es-CO', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {order.status === 'in_preparation' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-400 text-xs">En cocina</span>
                    </div>
                  )}
                  {order.status === 'pending_payment' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="text-yellow-400 text-xs">Esperando comprobante</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {orders.length === 0 && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
              <CheckCircle size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">
                {filter === 'active' ? 'No hay órdenes activas en este momento' : 'No hay órdenes en el historial'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}