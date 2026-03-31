'use client'
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { MessageSquare, Users, Store, Activity } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [businesses, setBusinesses] = useState([])
  const [stats, setStats] = useState({ messages: 0, customers: 0, businesses: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')

      const { count: messageCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })

      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      setBusinesses(businessData || [])
      setStats({
        messages: messageCount || 0,
        customers: customerCount || 0,
        businesses: businessData?.length || 0
      })
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-green-400 text-xl animate-pulse">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">WaBot Platform</h1>
          <p className="text-zinc-400 mt-1">Panel de administración</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <Store size={20} className="text-green-400" />
              <span className="text-zinc-400 text-sm">Negocios activos</span>
            </div>
            <p className="text-4xl font-bold">{stats.businesses}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <Users size={20} className="text-green-400" />
              <span className="text-zinc-400 text-sm">Clientes totales</span>
            </div>
            <p className="text-4xl font-bold">{stats.customers}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare size={20} className="text-green-400" />
              <span className="text-zinc-400 text-sm">Mensajes procesados</span>
            </div>
            <p className="text-4xl font-bold">{stats.messages}</p>
          </div>
        </div>

        {/* Lista de negocios */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Negocios registrados</h2>
            <Activity size={18} className="text-green-400" />
          </div>
          <div className="divide-y divide-zinc-800">
            {businesses.map(b => (
              <Link key={b.id} href={`/dashboard/negocio/${b.id}`} className="p-6 flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-white">{b.name}</p>
                  <p className="text-zinc-400 text-sm mt-1">{b.business_type} · {b.phone_number}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${b.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {b.is_active ? 'Activo' : 'Inactivo'}
                </div>
              </Link>
            ))}
            {businesses.length === 0 && (
              <p className="p-6 text-zinc-500 text-center">No hay negocios registrados aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}